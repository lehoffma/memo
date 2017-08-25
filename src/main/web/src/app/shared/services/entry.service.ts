import {Injectable} from "@angular/core";
import {Entry} from "../model/entry";
import {Headers, Http, RequestOptions, RequestOptionsArgs, Response, URLSearchParams} from "@angular/http";
import {Observable} from "rxjs/Observable";
import {CacheStore} from "../stores/cache.store";
import {EventType} from "../../shop/shared/model/event-type";
import {ServletService} from "app/shared/services/servlet.service";
import {EntryCategoryService} from "./entry-category.service";

@Injectable()
export class EntryService extends ServletService<Entry> {
	redirectUrl: string;

	constructor(private http: Http,
				private entryCategoryService: EntryCategoryService,
				private cache: CacheStore) {
		super();
	}

	/**
	 * ....
	 * @param json
	 * @returns {Observable<Entry>}
	 */
	getEntryFromJSON(json: any): Observable<Entry> {
		if (json["entryCategoryID"]) {
			return this.entryCategoryService.getById(json["entryCategoryID"])
				.map(entryCategory => Entry.create().setProperties(json).setProperties({category: entryCategory}))
		}
		return Observable.of(Entry.create().setProperties(json));
	}

	/**
	 * ....
	 * @param {any[]} jsonArray
	 * @returns {Observable<Entry[]>}
	 */
	getEntriesFromJSON(jsonArray: any[]): Observable<Entry[]> {
		return Observable.combineLatest(...jsonArray.map(json => this.getEntryFromJSON(json)))
	}

	/**
	 *
	 * @param entryId
	 * @param eventId
	 * @param eventType
	 */
	getById(entryId: number, eventId?: number, eventType?: EventType): Observable<Entry> {
		let params = new URLSearchParams();
		if (entryId) {
			params.set("entryId", entryId.toString());
		}
		if (eventId && eventType) {
			params.set("eventId", eventId.toString());
			params.set("eventType", eventType.toString());
		}

		return this.performRequest(this.http.get("/api/entry", {search: params}))
			.map(response => response.json().entries)
			.flatMap(json => this.getEntryFromJSON(json[0]))
			.do(entry => console.log(entry))
			.do(entry => this.cache.addOrModify(entry));
	}

	/**
	 *
	 * @param eventId
	 */
	getEntriesOfEvent(eventId: number): Observable<Entry[]> {
		let params = new URLSearchParams();
		params.set("eventId", eventId.toString());


		return this.performRequest(this.http.get("/api/entry", {search: params}))
			.map(response => response.json().entries)
			.flatMap((jsonArray: any[]) => this.getEntriesFromJSON(jsonArray));
	}

	/**
	 *
	 * @param searchTerm
	 * @param dateRange
	 */
	search(searchTerm: string, dateRange?: { minDate: Date, maxDate: Date }): Observable<Entry[]> {
		let params = new URLSearchParams();
		params.set("searchTerm", searchTerm);
		if (dateRange && dateRange.minDate && dateRange.maxDate) {
			//TODO date format
			params.set("minDate", dateRange.minDate.toISOString());
			params.set("maxDate", dateRange.maxDate.toISOString());
		}
		let url = `/api/entry`;

		return this.performRequest(this.http.get(url, {search: params}))
			.map(response => response.json().entries)
			.flatMap((jsonArray: any[]) => this.getEntriesFromJSON(jsonArray));
	}

	/**
	 *
	 * @param entry
	 * @param options
	 */
	add(entry: Entry, options?: any): Observable<Entry> {
		if (!entry["entryCategoryID"]) {
			entry["entryCategoryID"] = entry.category.id;
		}

		return this.addOrModify(this.http.post.bind(this.http), entry, options);
	}

	/**
	 *
	 * @param entry
	 * @param options
	 * @returns {Observable<Entry>}
	 */
	modify(entry: Entry, options?: any): Observable<Entry> {
		if (!entry["entryCategoryID"]) {
			entry["entryCategoryID"] = entry.category.id;
		}
		return this.addOrModify(this.http.put.bind(this.http), entry, options);
	}

	/**
	 *
	 * @param id
	 * @param options
	 */
	remove(id: number, options?: any): Observable<Response> {
		let params = new URLSearchParams();
		params.set("id", "" + id);
		return this.performRequest(this.http.delete("/api/entry", {search: params}));
	}

	/**
	 * Hilfsmethode um den code übersichtlicher zu gestalten
	 * @param requestMethod
	 * @param entry
	 * @param options
	 * @returns {Observable<T>}
	 */
	private addOrModify(requestMethod: (url: string, body: any, options?: RequestOptionsArgs) => Observable<Response>,
						entry: Entry, options?: any): Observable<Entry> {
		const headers = new Headers({"Content-Type": "application/json"});
		const requestOptions = new RequestOptions({headers});
		requestOptions.body = {};
		requestOptions.body["entry"] = entry;

		if (options) {
			Object.keys(options)
				.forEach(key => requestOptions.body[key] = options[key]);
		}

		return this.performRequest(requestMethod("/api/entry", {entry}, requestOptions))
			.map(response => response.json().id)
			.flatMap(id => this.getById(id));
	}

}
