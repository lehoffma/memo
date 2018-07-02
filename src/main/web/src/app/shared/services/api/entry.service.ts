import {Injectable} from "@angular/core";
import {createEntry, Entry} from "../../model/entry";
import {AddOrModifyRequest, AddOrModifyResponse, ServletService} from "app/shared/services/api/servlet.service";
import {EntryCategoryService} from "./entry-category.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {combineLatest, Observable} from "rxjs";
import {map, mergeMap, tap} from "rxjs/operators";
import {EventService} from "./event.service";
import {PageRequest} from "../../model/api/page-request";
import {Sort} from "../../model/api/sort";
import {Filter} from "../../model/api/filter";
import {Page} from "../../model/api/page";
import {ParamMap} from "@angular/router";
import {setProperties} from "../../model/util/base-object";

interface EntryApiResponse {
	entries: Entry[];
}

@Injectable()
export class EntryService extends ServletService<Entry> {
	redirectUrl: string;

	constructor(protected http: HttpClient,
				private eventService: EventService,
				private entryCategoryService: EntryCategoryService) {
		super(http, "/api/entry");
	}


	jsonToObservable(json: any): Observable<Entry> {
		return combineLatest(
			this.entryCategoryService.getById(json["category"]),
			this.eventService.getById(json["item"])
		)
			.pipe(
				map(([category, item]) => setProperties(setProperties(createEntry(), json), {category, item}))
			)
	}

	/**
	 *
	 * @param eventId
	 * @param pageRequest
	 * @param sort
	 */
	getEntriesOfEvent(eventId: number,
					  pageRequest: PageRequest,
					  sort: Sort): Observable<Page<Entry>> {
		return this.get(
			Filter.by({"eventId": "" + eventId}),
			pageRequest,
			sort
		);
	}

	//todo get by filter options

	paramMapToFilter(queryParamMap: ParamMap): Filter {
		const allowedParameters = ["minDate", "maxDate", "eventId", "entryType"];
		return this.toFilter(queryParamMap, allowedParameters);
	}

	/**
	 *
	 * @param id
	 * @param options
	 */
	remove(id: number, options?: any): Observable<Object> {
		return this.performRequest(this.http.delete(this.baseUrl, {
			params: new HttpParams().set("id", "" + id),
			responseType: "text"
		}))
			.pipe(
				tap(() => this._cache.invalidateById(id))
			);
	}

	/**
	 * Hilfsmethode um den code übersichtlicher zu gestalten
	 * @param requestMethod
	 * @param entry
	 * @param options
	 * @returns {Observable<T>}
	 */
	addOrModify(requestMethod: AddOrModifyRequest,
				entry: Entry, options?: any): Observable<Entry> {
		let body = {};

		if (options) {
			Object.keys(options)
				.forEach(key => body[key] = options[key]);
		}

		if (entry["addresses"]) {
			delete entry["addresses"];
		}
		let {item, category, ...fixedEntry} = entry;
		fixedEntry["item"] = item.id === undefined ? item : item.id;
		fixedEntry["category"] = category.id === undefined ? category : category.id;

		return this.performRequest(requestMethod<AddOrModifyResponse>("/api/entry", {entry: fixedEntry, ...body}, {
			headers: new HttpHeaders().set("Content-Type", "application/json"),
		}))
			.pipe(
				tap(() => this._cache.invalidateById(entry.id)),
				mergeMap(response => this.getById(response.id))
			);
	}

}
