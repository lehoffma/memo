import {Observable, of, throwError} from "rxjs";
import {catchError, mergeMap, share} from "rxjs/operators";

export interface Unit<T> {
	request: (input: T) => Observable<T>,
	undo: (input: T) => Observable<any>
}

export class TransactionBuilder<T> {

	private units: Unit<T>[] = [];

	public constructor() {
	}

	public addUnit(unit: Unit<T>): TransactionBuilder<T> {
		this.units.push(unit);
		return this;
	}

	public add(request: (input: T) => Observable<T>, undo?: (input: T) => Observable<any>) {
		const unit = {request, undo: input => of(input)};
		if (undo) {
			unit.undo = undo;
		}
		this.units.push(unit);
		return this;
	}

	public begin(input: T): Observable<T> {
		const copy = Object.assign({}, input);

		const request = this.units.reduce((transaction, unit) => {
			return transaction
				.pipe(
					mergeMap(result => unit.request(result))
				)
		}, of(input));

		const undoRequest = this.units.reduce((transaction, unit) => {
			return transaction
				.pipe(
					mergeMap(() => unit.undo(copy))
				)
		}, of(input));

		return request
			.pipe(
				share(),
				catchError(error => {
					console.error(error);
					return undoRequest
					//rethrow after cleaning up so the user can handle the error himself
						.pipe(
							share(),
							mergeMap(() => throwError(error))
						)
				})
			)
	}
}
