import {BehaviorSubject, Observable, throwError} from "rxjs";
import {catchError, first, retry, share} from "rxjs/operators";
import {PagedApiCache} from "../../cache/api-cache";


export abstract class CachedService<T> {
	public changed$: { [id: number]: BehaviorSubject<any> } = {};
	private fallbacks$: { [id: number]: (id: number) => Observable<any> } = {};
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
	 * @param fallback
	 * @returns {Observable<T>}
	 */
	valueChanges<U = T>(id: number, fallback: (id: number) => Observable<U> = this.getById.bind(this)): Observable<U> {
		if (!this.changed$[id]) {
			this.changed$[id] = new BehaviorSubject<U>(null);
			this.fallbacks$[id] = fallback;
			this.fallbacks$[id](id)
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
	valueChanged<U>(id: number, newValue: U) {
		if (!this.changed$[id]) {
			this.changed$[id] = new BehaviorSubject<U>(null);
		}
		this.changed$[id].next(newValue);
	}

	/**
	 *
	 * @param {number} id
	 * @param removed
	 */
	invalidateValue(id: number, removed: boolean = false) {
		this._cache.invalidateById(id);
		if (!removed && id > 0 && this.changed$[id]) {
			this.fallbacks$[id](id)
				.subscribe(value => this.valueChanged(id, value));
		}
	}

	abstract getById(id: number, ...args: any[]): Observable<T>;
}
