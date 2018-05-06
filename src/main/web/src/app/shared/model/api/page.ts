import {Observable} from "rxjs";
import {map} from "rxjs/operators";

export interface Page<T> {
	content: T[];
	elements: number;
	empty: boolean;
	first: boolean;
	last: boolean;
	page: number;
	pageSize: number;
	totalElements: number;
	next?: () => Observable<Page<T>>;
	prev?: () => Observable<Page<T>>;
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
}
