import {Observable, of, Subject, throwError} from "rxjs";
import {catchError, take, tap} from "rxjs/operators";

interface CacheContent<T> {
	expiry: number;
	value: T;
}

/**
 * Cache for a single request
 */
export class Cache<T> {
	private cache: CacheContent<T>;
	private inFlightRequest: Subject<T>;

	constructor(public load: () => Observable<T>,
				private expiry = 300000) {
	}

	/**
	 *
	 * Example:
	 *
	 * first get():
	 * no cached value & no inFlightRequest
	 *        => this.load() is called and the result is written into the inFlightRequest
	 *
	 * second get():
	 * no cached value, but inFlightRequest
	 *        => return the same observable as for the first guy, to avoid duplicate http calls
	 *
	 * third get():
	 * has cached value
	 *        => returns the cached value immediately
	 *
	 * fourth get():
	 * cached value expired
	 *        => call load() again
	 *
	 *
	 * @returns {Observable<T>}
	 */
	get(): Observable<T> {
		if (this.hasValidCachedValue()) {
			return of(this.cache.value);
		}
		//cache value has expired or its the first time calling this method (inFlight is undefined)
		// 		=> reload the cache value again
		else if (this.cache !== undefined || !this.inFlightRequest) {
			this.inFlightRequest = new Subject();
			this.load()
				.pipe(
					//update cached value once the request is done
					tap(value => this.setValue(value)),
					//avoid memory leaks by only subscribing to the first value
					take(1),
					catchError(error => {
						console.error(error);
						return throwError(error);
					})
				)
				//push result of http request into inFlightRequest
				.subscribe(this.inFlightRequest);
		}

		return this.inFlightRequest;
	}

	/**
	 * Removes the cached value, which is be useful for when an item is edited or removed
	 */
	invalidate() {
		this.cache = undefined;
		if (this.inFlightRequest) {
			const observers = this.inFlightRequest.observers;
			//complete the stream for every observer to avoid memory leaks/dangling subscriptions
			observers.forEach(observer => observer.complete());
		}
		this.inFlightRequest = undefined;
	}

	/**
	 *
	 * @param {T} value
	 */
	private setValue(value: T) {
		this.cache = {
			expiry: Date.now() + this.expiry,
			value
		}
	}

	/**
	 *
	 * @param {string} key
	 * @returns {boolean}
	 */
	private hasValidCachedValue(): boolean {
		return this.cache !== undefined && this.cache.expiry > Date.now();
	}
}
