import {Injectable} from '@angular/core';
import {ServletService} from "./servlet.service";
import {EntryCategory} from "../../model/entry-category";
import {Observable} from "rxjs/Observable";
import {Response} from "@angular/http";
import {HttpClient, HttpParams} from "@angular/common/http";
import {CacheStore} from "../../cache/cache.store";

interface EntryCategoryApiResponse {
	categories: EntryCategory[]
}

@Injectable()
export class EntryCategoryService extends ServletService<EntryCategory> {
	baseUrl = "/api/entryCategory";

	constructor(public http: HttpClient,
				private cache: CacheStore) {
		super();
	}

	/**
	 *
	 * @param {number} id
	 * @returns {Observable<EntryCategory>}
	 */
	getById(id: number): Observable<EntryCategory> {
		const params = new HttpParams().set("categoryId", "" + id);
		const request = this.http.get<EntryCategoryApiResponse>(this.baseUrl, {params})
			.map(json => EntryCategory.create().setProperties(json.categories[0]));

		return this._cache.getById(params, request);
	}

	/**
	 *
	 * @returns {Observable<EntryCategory[]>}
	 */
	getCategories(): Observable<EntryCategory[]> {
		return this.search("");
	}

	/**
	 *
	 * @param {string} searchTerm
	 * @returns {Observable<EntryCategory[]>}
	 */
	search(searchTerm: string): Observable<EntryCategory[]> {
		const params = new HttpParams().set("searchTerm", "" + searchTerm);
		const request = this.http.get<EntryCategoryApiResponse>(this.baseUrl, {params})
			.map(response => response.categories);

		return this._cache.search(params, request);
	}

	/**
	 *
	 * @param {EntryCategory} object
	 * @returns {Observable<EntryCategory>}
	 */
	add(object: EntryCategory): Observable<EntryCategory> {
		return undefined;
	}

	/**
	 *
	 * @param {EntryCategory} object
	 * @returns {Observable<EntryCategory>}
	 */
	modify(object: EntryCategory): Observable<EntryCategory> {
		return undefined;
	}

	/**
	 *
	 * @param {number} id
	 * @returns {Observable<Response>}
	 */
	remove(id: number): Observable<Response> {
		return undefined;
	}

}
