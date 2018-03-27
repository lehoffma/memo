import {TypeOfProperty} from "../model/util/type-of-property";
import {Observable} from "rxjs/Observable";
import {Cache} from "./cache";
import {map} from "rxjs/operators";
import {of} from "rxjs/observable/of";


export class ObservableCache<T> {
	private _cache: {
		[key in keyof T]?: Cache<T[key]>
	} = {};

	constructor(private value$: Observable<T>) {

	}

	withAsyncFallback(key: string, fallback: () => Observable<TypeOfProperty<T>>): this {
		this._cache[key] = new Cache(fallback, Infinity);
		return this;
	}

	withFallback(key: string, fallback: () => TypeOfProperty<T>): this {
		return this.withAsyncFallback(key, () => of(fallback()));
	}

	get(key: keyof T): Observable<TypeOfProperty<T>> {
		if (!this._cache[key]) {
			this._cache[key] = new Cache(() => this.value$.pipe(map(it => it[key])));
		}

		return this._cache[key].get();
	}
}
