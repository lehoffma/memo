import {Cache} from "./cache";
import {HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {Page} from "../model/api/page";

interface ApiInnerCache<T> {
	getById: {
		[params: string]: Cache<T>
	};
	search: {
		[params: string]: Cache<T[]>
	};
	other: {
		[params: string]: Cache<any>
	}
}

export class BaseApiCache<T, U> {
	private cache: ApiInnerCache<T> = {
		getById: {},
		search: {},
		other: {}
	};

	/**
	 *
	 * @param {HttpParams} params
	 * @param {Observable<T>} fallback
	 * @returns {Observable<T>}
	 */
	getById(params: HttpParams, fallback: Observable<T>): Observable<T> {
		const key = this.getKeyFromParams(params);
		return (<Observable<T>>this.getFromCache("getById", key, fallback));
	}

	/**
	 *
	 * @param {HttpParams} params
	 * @param {Observable<T>} fallback
	 * @returns {Observable<T[]>}
	 */
	search(params: HttpParams, fallback: Observable<U>): Observable<U> {
		const key = this.getKeyFromParams(params);
		return (<Observable<U>>this.getFromCache("search", key, fallback));
	}

	/**
	 *
	 * @param {HttpParams} params
	 * @param {Observable<any>} fallback
	 * @returns {Observable<any>}
	 */
	other<V>(params: HttpParams, fallback: Observable<V>): Observable<V> {
		const key = this.getKeyFromParams(params);
		return (<Observable<V>>this.getFromCache("other", key, fallback));
	}

	/**
	 *
	 * @param {number} id
	 */
	invalidateById(id: number) {
		this.invalidateParams("getById", new HttpParams().set("id", "" + id));
		//since we removed one of the values by Id, we have to invalidate the previous search results as well
		this.invalidateType("search");
	}

	/**
	 * Similar to invalidateParams, but instead of invalidating only one value, which matches the given params
	 * exactly, all values that match the params partially will be invalidated.
	 * @param {HttpParams} params
	 */
	invalidateByPartialParams(params: HttpParams) {
		const partialKey = this.getKeyFromParams(params);
		Object.keys(this.cache)
			.forEach((cacheType: keyof ApiInnerCache<T>) => Object.keys(this.cache[cacheType])
				.filter(cacheKey => this.matchesPartialParamKey(cacheKey, partialKey))
				.forEach(cacheKey => {
					this.invalidate(cacheType, cacheKey);
				})
			)
	}

	/**
	 *
	 * @param {keyof ApiInnerCache<T>} type
	 * @param {HttpParams} params
	 */
	invalidateParams(type: keyof ApiInnerCache<T>, params: HttpParams) {
		const key = this.getKeyFromParams(params);
		this.invalidate(type, key);
	}

	/**
	 *
	 * @param {keyof ApiInnerCache<T>} type
	 */
	invalidateType(type: keyof ApiInnerCache<T>) {
		Object.keys(this.cache[type]).forEach(key => this.invalidate(type, key));
	}

	/**
	 *
	 */
	invalidateAll() {
		Object.keys(this.cache).forEach((key: keyof ApiInnerCache<T>) => this.invalidateType(key));
	}

	/**
	 *
	 * @param {keyof ApiInnerCache<T>} type
	 * @param key
	 */
	private invalidate(type: keyof ApiInnerCache<T>, key: string) {
		if (this.cache[type][key]) {
			console.debug(`Invalidating Cache for type ${type} and key ${key}.`);
			this.cache[type][key].invalidate();
		}
	}

	/**
	 * Returns the cache object from the inner cache map, also creates a new cache object if there is none for the given key
	 * @param {keyof ApiInnerCache<T>} type
	 * @param {string} key
	 * @param {Observable<T>} fallback
	 * @returns {Observable<T> | Observable<T[]>}
	 */
	private getFromCache(type: keyof ApiInnerCache<T>, key: string, fallback: Observable<T> | Observable<T[]> | Observable<any>): Observable<T> | Observable<T[]> | Observable<any> {
		if (!this.cache[type][key]) {
			// console.debug(`Cache for type ${type} and key ${key} doesn't exist, fallback will be used`);
			this.cache[type][key] = new Cache<any>(() => fallback);
		}
		// console.debug(`type ${type} and key ${key} is cached`);
		return this.cache[type][key].get();
	}

	/**
	 *
	 * @param {string} key
	 * @param {string} partialKey
	 */
	private matchesPartialParamKey(key: string, partialKey: string) {
		return partialKey.split("&")
			.every(value => key.includes(value));
	}

	/**
	 *
	 * @param {HttpParams} params
	 * @returns {string}
	 */
	private getKeyFromParams(params: HttpParams): string {
		const key = params.keys()
			.sort()
			.map(key => key + "=" + params.get(key))
			.join("&")
			.toLowerCase();

		if (key.length > 0) {
			return key;
		}
		return "none";
	}
}


export class ApiCache<T> extends BaseApiCache<T, T> {

}

export class PagedApiCache<T> extends BaseApiCache<T, Page<T>> {

}

