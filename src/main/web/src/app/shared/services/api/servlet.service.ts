import {ServletServiceInterface} from "../../model/servlet-service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {combineLatest, Observable, of, throwError} from "rxjs";
import {CachedService} from "./cached.service";
import {defaultIfEmpty, map, mergeMap, tap} from "rxjs/operators";
import {Filter} from "../../model/api/filter";
import {PageRequest} from "../../model/api/page-request";
import {Direction, Sort} from "../../model/api/sort";
import {Entry} from "../../model/entry";
import {Page} from "../../model/api/page";
import {TableDataService} from "../../utility/material-table/table-data-service";
import {ParamMap, Params} from "@angular/router";
import {getAllQueryValues} from "../../model/util/url-util";

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
						throw new Error("ID doesn't exist");
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
				const value = getAllQueryValues(queryParamMap, parameter).join(",");
				return Filter.add(filter, parameter, value);
			}
			return filter;
		}, Filter.none());
	}

	/**
	 *
	 * @param {HttpParams} params
	 * @param url
	 * @returns {Observable<Page<T>>}
	 */
	getRequest(params: HttpParams, url: string = this.baseUrl): Observable<Page<T>> {
		return this.performRequest(this.http.get<Page<T>>(url, {params}))
			.pipe(
				mergeMap((json) => {
					return combineLatest(
						json.content
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
		return this.getForUrl(this.baseUrl, filter, pageRequest, sort);
	}

	protected getForCustomUrl<U>(url: string,
								 params: HttpParams,
								 request: Observable<U> = this.http.get<U>(url, {params})): Observable<U> {
		const cacheParams = params.set("_cacheUrl", url);
		return this._cache.other(cacheParams, request);
	}

	protected getPagedForCustomUrl(url: string, filter: Filter, pageRequest: PageRequest, sort: Sort): Observable<Page<T>> {
		const params = this.buildParams(filter, pageRequest, sort);
		const request = this.getRequest(params, url)
			.pipe(
				map(page => this.addPrevAndNext(page, filter, pageRequest, sort))
			);

		return this.getForCustomUrl(url, params, request);
	}

	/**
	 *
	 * @param url
	 * @param {Filter} filter
	 * @param {PageRequest} pageRequest
	 * @param {Sort} sort
	 * @returns {Observable<Page<T>>}
	 */
	getForUrl(url: string, filter: Filter, pageRequest: PageRequest, sort: Sort): Observable<Page<T>> {
		const params = this.buildParams(filter, pageRequest, sort);
		const request = this.getRequest(params, url)
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


	remove(id: number, additionalParams?: Params, ...args: any[]): Observable<Object> {
		let params = new HttpParams().set("id", "" + id);
		if (additionalParams) {
			params = Object.keys(additionalParams)
				.reduce((httpParams, key) => httpParams.set(key, additionalParams[key]), params);
		}

		return this.performRequest(this.http.delete(this.baseUrl, {
			params
		}))
			.pipe(
				tap(() => this.invalidateValue(id, true)),
			);
	}
}
