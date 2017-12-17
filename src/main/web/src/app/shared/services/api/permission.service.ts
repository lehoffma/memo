import {Injectable} from '@angular/core';
import {ApiCache} from "../../cache/api-cache";
import {Observable} from "rxjs/Observable";
import {Permission, UserPermissions} from "../../model/permission";
import {HttpClient, HttpParams} from "@angular/common/http";
import {catchError, retry} from "rxjs/operators";
import {of} from "rxjs/observable/of";

@Injectable()
export class PermissionService {
	protected _cache: ApiCache<Permission> = new ApiCache<Permission>();
	private baseUrl = "/api/permissions";

	constructor(private http: HttpClient) {
	}

	/**
	 *
	 * @param error
	 * @returns {any}
	 */
	private handleError(error: Error): Observable<any> {
		console.error(error);
		return of(error);
	}

	/**
	 *
	 * @param requestObservable
	 * @returns {Observable<T>}
	 */
	private request<U>(requestObservable: Observable<U>): Observable<U> {
		return requestObservable
			.pipe(
				//retry 2 times before throwing an error
				retry(2),
				//log any errors
				catchError(error => this.handleError(error))
			)
	}

	get(userId: number, eventId?: number): Observable<Permission> {
		//todo
		let params = new HttpParams()
			.set("userId", "" + userId);
		if (eventId) {
			params = params.set("eventId", "" + eventId);
		}
		const request = this.request(this.http.get<{ permission: Permission }>(this.baseUrl, {params}))
			.map(json => json.permission);

		return this._cache.other<Permission>(params, request);
	}

	set(userId: number, permissions: UserPermissions): Observable<number> {
		//todo
		const params = new HttpParams()
			.set("userId", "" + userId);
		return this.request(this.http.post<{ userId: number }>(this.baseUrl, {permissions}, {params}))
			.map(json => json.userId);
	}

	setForEvent(userId: number, eventId: number, permission: Permission): Observable<number> {
		const params = new HttpParams()
			.set("userId", "" + userId)
			.set("eventId", "" + eventId);
		return this.request(this.http.post<{ userId: number }>(this.baseUrl, {permission}, {params}))
			.map(json => json.userId);
	}
}
