import {Injectable} from "@angular/core";
import {ServletServiceInterface} from "../../model/servlet-service";
import {HttpHeaders, HttpParams} from "@angular/common/http";
import {ApiCache} from "../../cache/api-cache";
import {Observable} from "rxjs/Observable";
import {catchError, first, retry, share} from "rxjs/operators";
import {_throw} from "rxjs/observable/throw";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

export type AddOrModifyRequest = <T>(url: string, body: any | null, options?: {
	headers?: HttpHeaders;
	observe?: "body";
	params?: HttpParams;
	reportProgress?: boolean;
	responseType?: "json";
	withCredentials?: boolean;
}) => Observable<T>

export interface AddOrModifyResponse {
	id: number
}

@Injectable()
export abstract class ServletService<T> implements ServletServiceInterface<T> {
	protected _cache: ApiCache<T> = new ApiCache<T>();

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
			)
		//convert the observable to a hot observable, i.e. immediately perform the http request
		//instead of waiting for someone to subscribe
		// 		.publish().refCount()
		// .shareReplay(3, 10000)
		// .publishReplay(1)
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
		this.changed$[id].next(newValue);
	}

	/**
	 *
	 * @param {number} id
	 */
	invalidateValue(id: number) {
		this._cache.invalidateById(id);
		this.getById(id)
			.subscribe(value => this.valueChanged(id, value));
	}

	abstract getById(id: number, ...args: any[]): Observable<T>;

	abstract search(searchTerm: string, ...args: any[]): Observable<T[]>;

	abstract add(object: T, ...args: any[]): Observable<T>;

	abstract modify(object: T, ...args: any[]): Observable<T>;

	abstract remove(id: number, ...args: any[]): Observable<Object>;
}
