import {Injectable} from "@angular/core";
import {ServletServiceInterface} from "../../model/servlet-service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {combineLatest, Observable, of, throwError} from "rxjs";
import {CachedService} from "./cached.service";
import {defaultIfEmpty, map, mergeMap} from "rxjs/operators";
import {Filter} from "../../model/api/filter";
import {PageRequest} from "../../model/api/page-request";
import {Direction, Sort} from "../../model/api/sort";
import {Entry} from "../../model/entry";
import {Page} from "../../model/api/page";
import {TableDataService} from "../../utility/material-table/table-data-service";
import {ParamMap} from "@angular/router";

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

export abstract class ServletService<T> extends CachedService<T> implements ServletServiceInterface<T>, TableDataService<T> {

	protected constructor(protected http: HttpClient,
						  protected baseUrl: string) {
		super()
	}

	/**
	 *
	 * @param {HttpParams} params
	 * @param {(json: any) => T} jsonToObject
	 * @returns {Observable<T>}
	 */
	getIdRequest(params: HttpParams): Observable<T> {
		return this.performRequest(this.http.get<Page<T>>(this.baseUrl, {params}))
			.pipe(
				mergeMap(json => {
					if (json.empty) {
						throwError(new Error("ID doesn't exist"));
					}
					return this.jsonToObservable(json.content[0])
				})
			);
	}

	/**
	 *
	 * @param {ParamMap} queryParamMap
	 * @param {string[]} allowedParameters
	 * @returns {Filter}
	 */
	toFilter(queryParamMap: ParamMap, allowedParameters: string[]) {
		return allowedParameters.reduce((filter, parameter) => {
			if (queryParamMap.has(parameter)) {
				const value = queryParamMap.getAll(parameter).join("|");
				return Filter.add(filter, parameter, value);
			}
			return filter;
		}, Filter.none());
	}

	/**
	 *
	 * @param {HttpParams} params
	 * @returns {Observable<Page<T>>}
	 */
	getRequest(params: HttpParams): Observable<Page<T>> {
		return this.performRequest(this.http.get<Page<T>>(this.baseUrl, {params}))
			.pipe(
				mergeMap((json) => {
					return combineLatest(
						...json.content
							.map(it => this.jsonToObservable(it))
					)
						.pipe(
							defaultIfEmpty([]),
							map(content => ({
								...json,
								content
							}))
						);
				})
			);
	}

	/**
	 *
	 * @param json
	 * @returns {T}
	 */
	jsonToObject(json: any): T {
		return json;
	}

	/**
	 *
	 * @param json
	 * @returns {Observable<T>}
	 */
	jsonToObservable(json: any): Observable<T> {
		return of(this.jsonToObject(json))
	}

	/**
	 *
	 * @param {number} id
	 * @param args
	 * @returns {Observable<T>}
	 */
	getById(id: number, ...args: any[]): Observable<T> {
		const params = new HttpParams().set("id", "" + id);
		const request = this.getIdRequest(params);

		return this._cache.getById(params, request);
	}

	/**
	 *
	 * @param filter
	 * @param pageRequest
	 * @param sort
	 * @returns {HttpParams}
	 */
	buildParams(filter: Filter, pageRequest: PageRequest, sort: Sort) {
		let params = new HttpParams()
			.set("page", "" + pageRequest.page)
			.set("pageSize", "" + pageRequest.pageSize);

		if (sort.direction !== Direction.NONE) {
			params = params
				.set("direction", sort.direction);
		}

		params = sort.sortBys.reduce((requestParams, sortBy) => {
			return requestParams.set("sortBy", sortBy);
		}, params);

		return Object.keys(filter)
			.reduce((requestParams, key) => {
				return requestParams.set(key, filter[key]);
			}, params)
	}

	getPrev(filter: Filter, pageRequest: PageRequest, sort: Sort): () => Observable<Page<T>> {
		if (pageRequest.page === 0) {
			return null;
		}

		return () => this.get(filter, pageRequest.prev(), sort);
	}

	getNext(filter: Filter, pageRequest: PageRequest, sort: Sort): () => Observable<Page<T>> {
		return () => this.get(filter, pageRequest.next(), sort);
	}

	addPrevAndNext(page: Page<T>, filter: Filter, pageRequest: PageRequest, sort: Sort): Page<T> {
		return {
			...page,
			prev: this.getPrev(filter, pageRequest, sort),
			next: this.getNext(filter, pageRequest, sort)
		}
	}

	/**
	 *
	 * @param {Filter} filter
	 * @param {PageRequest} pageRequest
	 * @param {Sort} sort
	 * @returns {Observable<Page<T>>}
	 */
	get(filter: Filter, pageRequest: PageRequest, sort: Sort): Observable<Page<T>> {
		const params = this.buildParams(filter, pageRequest, sort);
		const request = this.getRequest(params)
			.pipe(
				map(page => this.addPrevAndNext(page, filter, pageRequest, sort))
			);

		return this._cache.search(params, request);
	}


	/**
	 *
	 * @param {Filter} filter
	 * @param {Sort} sort
	 * @returns {Observable<T[]>}
	 */
	getAll(filter: Filter, sort: Sort): Observable<T[]> {
		return this.get(filter, PageRequest.first(10000), sort).pipe(
			map(it => it.content)
		)
	}

	/**
	 *
	 * @param entry
	 * @param options
	 */
	add(entry: T, options?: any): Observable<T> {
		return this.addOrModify(this.http.post.bind(this.http), entry, options);
	}

	/**
	 *
	 * @param entry
	 * @param options
	 * @returns {Observable<Entry>}
	 */
	modify(entry: T, options?: any): Observable<T> {
		return this.addOrModify(this.http.put.bind(this.http), entry, options);
	}


	/**
	 * Invalidates all caches.
	 * This function is used for logout events, since the canRead property has to be evaluated again, which only
	 * happens when the corresponding request isn't cached anymore and the service has to request new data.
	 */
	clearCaches() {
		this._cache.invalidateAll();
	}

	abstract addOrModify(requestMethod: AddOrModifyRequest,
						 entry: T, options?: any): Observable<T>;

	abstract remove(id: number, ...args: any[]): Observable<Object>;
}
