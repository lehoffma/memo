import {Injectable} from "@angular/core";
import {ServletServiceInterface} from "../model/servlet-service";
import {Observable} from "rxjs/Observable";
import {Response} from "@angular/http";

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
	performRequest<T>(requestObservable: Observable<T>): Observable<T> {
		return requestObservable
		//retry 3 times before throwing an error
			.retry(3)
			//log any errors
			.catch(this.handleError)
			//convert the observable to a hot observable, i.e. immediately perform the http request
			//instead of waiting for someone to subscribe
			.publish().refCount();
	}


	abstract getById(id: number, ...args: any[]): Observable<T>;

	abstract search(searchTerm: string, ...args: any[]): Observable<T[]>;

	abstract add(object: T, ...args: any[]): Observable<T>;

	abstract modify(object: T, ...args: any[]): Observable<T>;

	abstract remove(id: number, ...args: any[]): Observable<Response>;
}
