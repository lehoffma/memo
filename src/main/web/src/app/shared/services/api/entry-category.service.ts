import {Injectable} from "@angular/core";
import {AddOrModifyRequest, ServletService} from "./servlet.service";
import {EntryCategory} from "../../model/entry-category";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs/Observable";
import {Filter} from "../../model/api/filter";
import {PageRequest} from "../../model/api/page-request";
import {Sort} from "../../model/api/sort";
import {Page} from "../../model/api/page";

interface EntryCategoryApiResponse {
	categories: EntryCategory[]
}

@Injectable()
export class EntryCategoryService extends ServletService<EntryCategory> {
	constructor(public http: HttpClient) {
		super(http, "/api/entryCategory");
	}

	/**
	 *
	 * @returns {Observable<EntryCategory[]>}
	 */
	getCategories(): Observable<Page<EntryCategory>> {
		return this.get(
			Filter.none(),
			PageRequest.first(),
			Sort.none()
		)
	}

	/**
	 *
	 * @param {number} id
	 * @returns {Observable<Object>}
	 */
	remove(id: number): Observable<Object> {
		return undefined;
	}

	addOrModify(requestMethod: AddOrModifyRequest, entry: EntryCategory, options?: any): Observable<EntryCategory> {
		return undefined;
	}

}
