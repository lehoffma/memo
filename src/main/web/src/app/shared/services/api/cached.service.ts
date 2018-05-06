import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";
import {catchError, first, retry, share} from "rxjs/operators";
import {_throw} from "rxjs/observable/throw";
import {ApiCache, PagedApiCache} from "../../cache/api-cache";


export abstract class CachedService<T> {
	protected _cache: PagedApiCache<T> = new PagedApiCache<T>();

	public changed$: { [id: number]: BehaviorSubject<T> } = {};

	protected constructor() {
	}

	/**
	 *
	 * @param error
	 * @returns {any}
	 */
	handleError(error: Error): Observable<any> {
		console.error(error);
		return _throw(error);
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
	 * @returns {Observable<T>}
	 */
	valueChanges(id: number): Observable<T> {
		if (!this.changed$[id]) {
			this.changed$[id] = new BehaviorSubject<T>(null);
			this.getById(id)
				.pipe(first())
				.subscribe(value => this.valueChanged(id, value));
		}
		return this.changed$[id].asObservable()
			.pipe(
				share()
			)
	}

	/**
	 *
	 * @param {number} id
	 * @param {T} newValue
	 */
	valueChanged(id: number, newValue: T) {
		if (!this.changed$[id]) {
			this.changed$[id] = new BehaviorSubject<T>(null);
		}
		this.changed$[id].next(newValue);
	}

	/**
	 *
	 * @param {number} id
	 * @param removed
	 */
	invalidateValue(id: number, removed: boolean = false) {
		console.log("invalidate " + id);
		this._cache.invalidateById(id);
		if(!removed){
			this.getById(id)
				.subscribe(value => this.valueChanged(id, value));
		}
	}

	abstract getById(id: number, ...args: any[]): Observable<T>;
}
