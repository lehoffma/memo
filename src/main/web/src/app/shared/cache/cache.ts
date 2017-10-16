import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";

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
	readonly DEFAULT_EXPIRY = 300000;

	constructor(public load: () => Observable<T>) {

	}

	/**
	 *
	 * Example:
	 *
	 * first get():
	 * no cached value & no inFlightRequest
	 * 		=> this.load() is called and the result is written into the inFlightRequest
	 *
	 * second get():
	 * no cached value, but inFlightRequest
	 * 		=> return the same observable as for the first guy, to avoid duplicate http calls
	 *
	 * third get():
	 * has cached value
	 * 		=> returns the cached value immediately
	 *
	 * fourth get():
	 * cached value expired
	 * 		=> call load() again
	 *
	 *
	 * @returns {Observable<T>}
	 */
	get(): Observable<T> {
		if (this.hasValidCachedValue()) {
			return Observable.of(this.cache.value);
		}
		//cache value has expired or its the first time calling this method (inFlight is undefined)
		// 		=> reload the cache value again
		else if (this.cache !== undefined || !this.inFlightRequest) {
			this.inFlightRequest = new Subject();
			this.load()
				//update cached value once the request is done
				.do(value => this.setValue(value))
				//avoid memory leaks by only subscribing to the first value
				.first()
				//push result of http request into inFlightRequest
				.subscribe(this.inFlightRequest);
		}

		return this.inFlightRequest;
	}

	/**
	 *
	 * @param {T} value
	 */
	private setValue(value: T) {
		this.cache = {
			expiry: Date.now() + this.DEFAULT_EXPIRY,
			value
		}
	}

	/**
	 * Removes the cached value, which is be useful for when an item is edited or removed
	 */
	invalidate() {
		this.cache = undefined;
		if(this.inFlightRequest){
			const observers = this.inFlightRequest.observers;
			//complete the stream for every observer to avoid memory leaks/dangling subscriptions
			observers.forEach(observer => observer.complete());
		}
		this.inFlightRequest = undefined;
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
