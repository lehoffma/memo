import {Injectable} from '@angular/core';
import {ServletService} from "./servlet.service";
import {EntryCategory} from "../model/entry-category";
import {Observable} from "rxjs/Observable";
import {Http, Response} from "@angular/http";

@Injectable()
export class EntryCategoryService extends ServletService<EntryCategory>{
	baseUrl = "/api/entryCategory";

	constructor(public http:Http) {
		super();
	}

	/**
	 *
	 * @param {number} id
	 * @param args
	 * @returns {Observable<EntryCategory>}
	 */
	getById(id: number): Observable<EntryCategory> {
		return this.http.get(this.baseUrl, {body: id})
			.map(response => response.json())
			.map(json => EntryCategory.create().setProperties(json));
	}

	/**
	 *
	 * @returns {Observable<EntryCategory[]>}
	 */
	getCategories():Observable<EntryCategory[]>{
		return this.search("");
	}

	/**
	 *
	 * @param {string} searchTerm
	 * @returns {Observable<EntryCategory[]>}
	 */
	search(searchTerm: string): Observable<EntryCategory[]> {
		let params = new URLSearchParams();
		params.set("searchTerm", searchTerm);

		return this.http.get(this.baseUrl, {search: params})
			.map(response => response.json().entryCategories as EntryCategory[]);
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
