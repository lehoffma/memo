import {Injectable} from "@angular/core";
import {Entry} from "../../model/entry";
import {AddOrModifyRequest, AddOrModifyResponse, ServletService} from "app/shared/services/api/servlet.service";
import {EntryCategoryService} from "./entry-category.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs/Observable";
import {map, mergeMap, tap} from "rxjs/operators";
import {combineLatest} from "rxjs/observable/combineLatest";
import {EventService} from "./event.service";
import {PageRequest} from "../../model/api/page-request";
import {Sort} from "../../model/api/sort";
import {Filter} from "../../model/api/filter";
import {Page} from "../../model/api/page";

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
				map(([category, item]) => Entry.create().setProperties(json).setProperties({category, item}))
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
