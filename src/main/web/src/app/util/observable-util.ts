import {Observable} from "rxjs/Observable";
import {filter, map, mergeMap, share, take} from "rxjs/operators";
import {of} from "rxjs/observable/of";
import {forkJoin} from "rxjs/observable/forkJoin";
import {combineLatest} from "rxjs/observable/combineLatest";
import {isEdited} from "./util";


export function processSequentially<T>(observables: Observable<T>[]): Observable<T[]> {
	return observables.reduce((requests: Observable<T[]>, request: Observable<T>) => {
		return requests
			.pipe(
				mergeMap(values => request
					.pipe(map(it => [...values, it]))
				)
			);
	}, of([]));
}

export function processSequentiallyAndWait<T>(observables: Observable<T>[]): Observable<T[]> {
	return processSequentially(observables)
		.pipe(
			filter(it => it.length === observables.length),
		)
}

export function processInParallelAndWait<T>(observables: Observable<T>[]): Observable<T[]> {
	if (observables.length === 0) {
		return of([]);
	}
	return forkJoin(...observables)
}


export function updateList<T extends { id: number }, U extends { setProperties: any }>(previousValue: T[],
																					   currentValue: T[],
																					   object: U,
																					   key: keyof U,
																					   mapBeforeRequest: (value: T) => any,
																					   add: (value: T) => Observable<T>,
																					   modify: (value: T) => Observable<T>,
																					   remove: (value: number) => Observable<any>,
): Observable<number[]> {
	let added: T[] = [];
	let removed: T[] = [];
	let modified: T[] = [];
	//both arrays are the same length => nothing has changed or something was edited
	//accounts < previousValue => something was removed
	if (previousValue.length === currentValue.length) {
		const index = previousValue.findIndex(it =>
			!!currentValue.find(prev => isEdited(prev, it, ["id"]))
		);
		if (index >= 0) {
			modified.push(previousValue[index]);
		}
		//otherwise, nothing changed
	}
	//something was added
	else if (previousValue.length < currentValue.length) {
		//find the address that is part of accounts, but not of previousValue
		const index = currentValue.findIndex(it =>
			//there is no address in prevValues that is equal to the one that is being checked here
			!previousValue.find(prev => !isEdited(it, prev, ["id"]))
		);

		added.push(currentValue[index]);
	}
	else if (previousValue.length > currentValue.length) {
		//find the address that is part of previousValue, but not of accounts
		const index = previousValue.findIndex(it =>
			//there is no address in accounts that is equal to the one that is being checked here
			!currentValue.find(prev => !isEdited(it, prev, ["id"]))
		);

		removed.push(previousValue[index]);
	}


	const addRequests = added
		.map(it => mapBeforeRequest(it))
		.map(it => add(it));
	const removeRequests = removed
		.map(it => mapBeforeRequest(it))
		.map(it => remove(it.id));
	const editRequests = modified
		.map(it => mapBeforeRequest(it))
		.map(it => modify(it));

	const combined = [
		...addRequests,
		...removeRequests,
		...editRequests,
	];
	if (combined.length === 0) {
		return null;
	}

	return processSequentiallyAndWait(
		combined
	)
		.pipe(
			take(1),
			share(),
			map(result => {
				if (!result || result.length === 0) {
					return [];
				}

				let newValues = [];
				if (addRequests.length > 0) {
					newValues.push(...result.slice(0, addRequests.length));
				}
				if (editRequests.length > 0) {
					newValues.push(...result.slice(
						addRequests.length + removeRequests.length));
				}

				const newIds: number[] = newValues.map(it => it.id);
				if (object) {
					newIds.push(...(<any>object[key])
						.filter(id => !removed.find((it: T) => it.id === id))
					);
				}

				return newIds;
			})
		)
}


export function updateListOfItem<T extends { id: number }, U extends { setProperties: any }>(previousValue: T[],
																							 currentValue: T[],
																							 object: U,
																							 key: keyof U,
																							 mapBeforeRequest: (value: T) => any,
																							 defaultValue: (object: U) => Observable<T[]>,
																							 add: (value: T) => Observable<T>,
																							 modify: (value: T) => Observable<T>,
																							 remove: (value: number) => Observable<any>,
																							 modifyObject: (object: U) => Observable<U>,
																							 getById: (id: number) => Observable<T>
) {
	return updateList(
		previousValue, currentValue, object, key, mapBeforeRequest, add, modify, remove
	)
		.pipe(
			mergeMap(newIds => {
				//there was nothing to update => return default
				if (newIds === null) {
					return defaultValue(object);
				}

				return modifyObject(object.setProperties({
					[key]: newIds
				}))
					.pipe(mergeMap(() => {
						if (newIds.length === 0) {
							return of([]);
						}
						return combineLatest(
							...newIds.map(id => getById(id))
						)
							.pipe(
								filter(it => it.length === newIds.length),
								take(1)
							)
					}))
			})
		)
}
