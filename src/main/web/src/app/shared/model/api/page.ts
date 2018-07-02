import {combineLatest, Observable, of} from "rxjs";
import {map, mergeMap} from "rxjs/operators";
import {PageRequest} from "./page-request";

export interface Page<T> {
	content: T[];
	elements: number;
	empty: boolean;
	first: boolean;
	last: boolean;
	page: number;
	pageSize: number;
	totalElements: number;
	next?: () => null | Observable<Page<T>>;
	prev?: () => null | Observable<Page<T>>;
}

export class PageResponse {
	static empty() {
		return {
			content: [],
			elements: 0,
			empty: true,
			first: true,
			last: true,
			page: 0,
			pageSize: 20,
			totalElements: 0
		}
	}

	static from<T>(content: T[], fullDataLength: number, pageRequest: PageRequest): Page<T> {
		return {
			content,
			elements: content.length,
			empty: content.length === 0,
			first: pageRequest.page === 0,
			last: content.length < pageRequest.pageSize
			|| (((pageRequest.page + 1) * pageRequest.pageSize) === fullDataLength),
			page: pageRequest.page,
			pageSize: pageRequest.pageSize,
			totalElements: fullDataLength
		}
	}

	static map<T, U>(page: Page<T>, mappingFunction: (value: T) => U): Page<U> {
		return {
			...page,
			content: page.content.map(it => mappingFunction(it)),
			prev: () => {
				if (!page.prev) {
					return null;
				}
				return page.prev()
					.pipe(
						map(prevPage => PageResponse.map(prevPage, mappingFunction))
					)
			},
			next: () => {
				if (!page.next) {
					return null;
				}
				return page.next()
					.pipe(
						map(nextPage => PageResponse.map(nextPage, mappingFunction))
					)
			}
		};
	}

	static mapToObservable<T, U>(page: Page<T>, mappingFunction: (value: T) => Observable<U>): Observable<Page<U>> {
		if (page.empty || page.content.length === 0) {
			return of(PageResponse.empty() as Page<U>)
		}

		return combineLatest(
			...page.content.map(content => mappingFunction(content))
		).pipe(
			map(mappedContent => ({
				...page,
				content: mappedContent,
				prev: () => {
					if (!page.prev) {
						return null;
					}
					return page.prev()
						.pipe(
							mergeMap(prevPage => PageResponse.mapToObservable(prevPage, mappingFunction))
						)
				},
				next: () => {
					if (!page.next) {
						return null;
					}
					return page.next()
						.pipe(
							mergeMap(nextPage => PageResponse.mapToObservable(nextPage, mappingFunction))
						)
				}
			}))
		)
	}
}
