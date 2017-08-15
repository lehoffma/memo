import {Injectable} from "@angular/core";
import {Entry} from "../model/entry";
import {Headers, Http, RequestOptions, RequestOptionsArgs, Response} from "@angular/http";
import {Observable} from "rxjs/Observable";
import {CacheStore} from "../stores/cache.store";
import {EventType} from "../../shop/shared/model/event-type";
import {ServletService} from "app/shared/services/servlet.service";

@Injectable()
export class EntryService extends ServletService<Entry> {

	constructor(private http: Http,
				private cache: CacheStore) {
		super();
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
			.map(json => Entry.create().setProperties(json))
			.do(entry => this.cache.addOrModify(entry));
	}

	/**
	 *
	 * @param eventId
	 * @param eventType
	 */
	getEntriesOfEvent(eventId: number, eventType: EventType): Observable<Entry[]> {
		let params = new URLSearchParams();
		params.set("eventId", eventId.toString());
		params.set("eventType", eventType.toString());


		return this.performRequest(this.http.get("/api/entry", {search: params}))
			.map(response => response.json().entries)
			.map((jsonArray: any[]) => jsonArray.map(json => Entry.create().setProperties(json)));
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
			.map((jsonArray: any[]) => jsonArray.map(json => Entry.create().setProperties(json)));
	}


	/**
	 * Hilfsmethode um den code übersichtlicher zu gestalten
	 * @param requestMethod
	 * @param entry
	 * @returns {Observable<T>}
	 */
	private addOrModify(requestMethod: (url: string, body: any, options?: RequestOptionsArgs) => Observable<Response>,
						entry: Entry): Observable<Entry> {
		const headers = new Headers({"Content-Type": "application/json"});
		const requestOptions = new RequestOptions({headers});

		return this.performRequest(requestMethod("/api/entry", {entry}, requestOptions))
			.map(response => response.json().id)
			.flatMap(id => this.getById(id));
	}


	/**
	 *
	 * @param entry
	 */
	add(entry: Entry): Observable<Entry> {
		return this.addOrModify(this.http.post.bind(this.http), entry);
	}

	/**
	 *
	 * @param entry
	 * @returns {Observable<Entry>}
	 */
	modify(entry: Entry): Observable<Entry> {
		return this.addOrModify(this.http.put.bind(this.http), entry);
	}

	/**
	 *
	 * @param id
	 */
	remove(id: number): Observable<Response> {
		return this.performRequest(this.http.delete("/api/entry", {body: {id: id}}));
	}

}
