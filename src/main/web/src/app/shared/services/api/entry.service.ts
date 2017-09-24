import {Injectable} from "@angular/core";
import {Entry} from "../../model/entry";
import {Observable} from "rxjs/Observable";
import {CacheStore} from "../../stores/cache.store";
import {AddOrModifyRequest, AddOrModifyResponse, ServletService} from "app/shared/services/api/servlet.service";
import {EntryCategoryService} from "./entry-category.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Moment} from "moment";

interface EntryApiResponse {
	entries: Entry[];
}

@Injectable()
export class EntryService extends ServletService<Entry> {
	redirectUrl: string;
	baseUrl = "/api/entry";

	constructor(private http: HttpClient,
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
		//todo...
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
	 */
	getById(entryId: number): Observable<Entry> {
		if (this.cache.isCached("entries", entryId)) {
			console.log(`entryId ${entryId} is cached`);
			return this.cache.cache.entries
				.map(entries => entries.find(entry => entry.id === entryId));
		}
		console.log(`entryId ${entryId} is not cached, retrieving from db`);

		return this.performRequest(this.http.get<EntryApiResponse>(this.baseUrl, {
			params: new HttpParams().set("entryId", "" + entryId)
		}))
			.flatMap(json => this.getEntryFromJSON(json.entries[0]))
			.do(entry => this.cache.addOrModify(entry));
	}

	/**
	 *
	 * @param eventId
	 */
	getEntriesOfEvent(eventId: number): Observable<Entry[]> {
		return this.performRequest(this.http.get<EntryApiResponse>(this.baseUrl, {
			params: new HttpParams().set("eventId", "" + eventId)
		}))
			.flatMap((json) => this.getEntriesFromJSON(json.entries));
	}

	/**
	 *
	 * @param searchTerm
	 * @param dateRange
	 */
	search(searchTerm: string, dateRange?: { minDate: Moment, maxDate: Moment }): Observable<Entry[]> {
		let params = new HttpParams().set("searchTerm", searchTerm);
		if (dateRange && dateRange.minDate && dateRange.maxDate) {
			params = params.set("minDate", dateRange.minDate.toISOString())
				.set("maxDate", dateRange.maxDate.toISOString());
		}

		return this.performRequest(this.http.get<EntryApiResponse>(this.baseUrl, {params}))
			.flatMap(json => this.getEntriesFromJSON(json.entries));
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
	remove(id: number, options?: any): Observable<Object> {
		return this.performRequest(this.http.delete(this.baseUrl, {
			params: new HttpParams().set("id", "" + id),
			responseType: "text"
		}));
	}

	/**
	 * Hilfsmethode um den code übersichtlicher zu gestalten
	 * @param requestMethod
	 * @param entry
	 * @param options
	 * @returns {Observable<T>}
	 */
	private addOrModify(requestMethod: AddOrModifyRequest,
						entry: Entry, options?: any): Observable<Entry> {
		let body = {};

		if (options) {
			Object.keys(options)
				.forEach(key => body[key] = options[key]);
		}

		return this.performRequest(requestMethod<AddOrModifyResponse>("/api/entry", {entry, ...body}, {
			headers: new HttpHeaders().set("Content-Type", "application/json"),
		}))
			.flatMap(response => this.getById(response.id));
	}

}
