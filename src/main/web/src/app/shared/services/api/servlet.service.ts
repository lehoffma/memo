import {Injectable} from "@angular/core";
import {ServletServiceInterface} from "../../model/servlet-service";
import {HttpHeaders, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs/Observable";
import {CachedService} from "./cached.service";

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
export abstract class ServletService<T> extends CachedService<T> implements ServletServiceInterface<T> {
	protected constructor() {
		super()
	}

	abstract getById(id: number, ...args: any[]): Observable<T>;

	abstract search(searchTerm: string, ...args: any[]): Observable<T[]>;

	abstract add(object: T, ...args: any[]): Observable<T>;

	abstract modify(object: T, ...args: any[]): Observable<T>;

	abstract remove(id: number, ...args: any[]): Observable<Object>;
}
