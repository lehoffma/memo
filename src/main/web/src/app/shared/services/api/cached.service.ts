import {BehaviorSubject, Observable, throwError} from "rxjs";
import {catchError, first, retry, share} from "rxjs/operators";
import {ApiInnerCache, PagedApiCache} from "../../cache/api-cache";


export abstract class CachedService<T> {
	public changed$: { [type in keyof ApiInnerCache<T>]: { [id: number]: BehaviorSubject<any> } } = {
		getById: {},
		other: {},
		search: {}
	};
	private fallbacks$: { [type in keyof ApiInnerCache<T>]: { [id: number]: (id: number) => Observable<any> } } = {
		getById: {},
		other: {},
		search: {}
	};
	protected _cache: PagedApiCache<T> = new PagedApiCache<T>();

	protected constructor() {
	}

	/**
	 *
	 * @param error
	 * @returns {any}
	 */
	handleError(error: Error): Observable<any> {
		console.error(error);
		return throwError(error);
	}

	/**
	 *
	 * @param requestObservable
	 * @returns {Observable<T>}
	 */
	performRequest<U>(requestObservable: Observable<U>): Observable<U> {
		return requestObservable
			.pipe(
				//retry 2 times before throwing an error
				retry(2),
				//log any errors
				catchError(error => this.handleError(error))
			);
	}

	/**
	 *
	 * @param {number} id
	 * @param type
	 * @param fallback
	 * @returns {Observable<T>}
	 */
	valueChanges<U = T>(id: number,
						type: keyof ApiInnerCache<T> = "getById",
						fallback: (id: number) => Observable<U> = this.getById.bind(this)): Observable<U> {
		if (!this.changed$[type][id]) {
			this.changed$[type][id] = new BehaviorSubject<U>(null);
			this.fallbacks$[type][id] = fallback;
			this.fallbacks$[type][id](id)
				.pipe(first())
				.subscribe(value => this.valueChanged(id, value, type));
		}
		return this.changed$[type][id].asObservable()
			.pipe(
				share()
			)
	}

	/**
	 *
	 * @param {number} id
	 * @param {T} newValue
	 * @param type
	 */
	valueChanged<U>(id: number, newValue: U,
					type: keyof ApiInnerCache<T> = "getById",) {
		if (!this.changed$[type][id]) {
			this.changed$[type][id] = new BehaviorSubject<U>(null);
		}
		this.changed$[type][id].next(newValue);
	}

	/**
	 *
	 * @param {number} id
	 * @param removed
	 * @param type
	 */
	invalidateValue(id: number, removed: boolean = false,
					type: keyof ApiInnerCache<T> = "getById",) {
		console.log("invalidate " + type + " " + id);
		switch (type) {
			case "getById":
				this._cache.invalidateById(id);
				break;
			case "other":
			case "search":
			//todo?
		}
		if (!removed && id > 0) {
			this.fallbacks$[type][id](id)
				.subscribe(value => this.valueChanged(id, value, type));
		}
	}

	abstract getById(id: number, ...args: any[]): Observable<T>;
}
