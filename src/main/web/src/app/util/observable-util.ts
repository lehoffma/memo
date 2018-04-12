import {Observable} from "rxjs/Observable";
import {filter, map, mergeMap, take} from "rxjs/operators";
import {of} from "rxjs/observable/of";
import {forkJoin} from "rxjs/observable/forkJoin";


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
