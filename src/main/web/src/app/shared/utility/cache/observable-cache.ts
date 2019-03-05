import {Observable, of} from "rxjs";
import {Cache} from "./cache";
import {EMPTY} from "rxjs";


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
				return EMPTY;
			}
		}

		return this._cache[key].get();
	}
}
