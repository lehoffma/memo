import {Injectable} from '@angular/core';
import {ServletService} from "./servlet.service";
import {EntryCategory} from "../../model/entry-category";
import {Observable} from "rxjs/Observable";
import {Response} from "@angular/http";
import {HttpClient, HttpParams} from "@angular/common/http";

interface EntryCategoryApiResponse {
	categories: EntryCategory[]
}

@Injectable()
export class EntryCategoryService extends ServletService<EntryCategory> {
	baseUrl = "/api/entryCategory";

	constructor(public http: HttpClient) {
		super();
	}

	//todo cache
	/**
	 *
	 * @param {number} id
	 * @param args
	 * @returns {Observable<EntryCategory>}
	 */
	getById(id: number): Observable<EntryCategory> {
		return this.http.get<EntryCategoryApiResponse>(this.baseUrl, {
			params: new HttpParams().set("categoryId", "" + id)
		})
			.map(json => EntryCategory.create().setProperties(json.categories[0]));
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
		return this.http.get<EntryCategoryApiResponse>(this.baseUrl, {
			params: new HttpParams().set("searchTerm", "" + searchTerm)
		})
			.map(response => response.categories);
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
