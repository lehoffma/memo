import {Observable} from "rxjs/Observable";
import {Cache} from "./cache";
import {of} from "rxjs/observable/of";
import {empty} from "rxjs/observable/empty";


export class ObservableCache<ValueType> {
	private _cache: {
		[key: string]: Cache<ValueType>
	} = {};

	constructor() {

	}

	withAsyncFallback(key: string, fallback: () => Observable<ValueType>): this {
		this._cache[key] = new Cache(fallback, Infinity);
		return this;
	}

	withFallback(key: string, fallback: () => ValueType): this {
		return this.withAsyncFallback(key, () => of(fallback()));
	}

	get(key: string, fallback?: () => ValueType): Observable<ValueType> {
		if (!this._cache[key]) {
			if (fallback) {
				this.withFallback(key, fallback);
			}
			else {
				return empty();
			}
		}

		return this._cache[key].get();
	}
}
