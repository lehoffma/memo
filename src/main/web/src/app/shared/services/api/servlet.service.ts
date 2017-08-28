import {Injectable} from "@angular/core";
import {ServletServiceInterface} from "../../model/servlet-service";
import {Observable} from "rxjs/Observable";
import {Response} from "@angular/http";
import {HttpHeaders, HttpParams} from "@angular/common/http";

export type AddOrModifyRequest = <T>(url: string, body: any | null, options?: {
	headers?: HttpHeaders;
	observe?: 'body';
	params?: HttpParams;
	reportProgress?: boolean;
	responseType?: 'json';
	withCredentials?: boolean;
}) => Observable<T>

export interface AddOrModifyResponse {
	id: number
}

@Injectable()
export abstract class ServletService<T> implements ServletServiceInterface<T> {
	constructor() {
	}

	/**
	 *
	 * @param error
	 * @returns {any}
	 */
	handleError(error: Error): Observable<any> {
		console.error(error);
		return Observable.of(error);
	}

	/**
	 *
	 * @param requestObservable
	 * @returns {Observable<T>}
	 */
	performRequest<U>(requestObservable: Observable<U>): Observable<U> {
		return requestObservable
		//retry 2 times before throwing an error
			.retry(2)
			//log any errors
			.catch(this.handleError)
			//convert the observable to a hot observable, i.e. immediately perform the http request
			//instead of waiting for someone to subscribe
			.share();
	}


	abstract getById(id: number, ...args: any[]): Observable<T>;

	abstract search(searchTerm: string, ...args: any[]): Observable<T[]>;

	abstract add(object: T, ...args: any[]): Observable<T>;

	abstract modify(object: T, ...args: any[]): Observable<T>;

	abstract remove(id: number, ...args: any[]): Observable<Object>;
}
