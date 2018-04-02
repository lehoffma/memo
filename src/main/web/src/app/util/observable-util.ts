import {Observable} from "rxjs/Observable";
import {map, mergeMap} from "rxjs/operators";
import {of} from "rxjs/observable/of";


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
