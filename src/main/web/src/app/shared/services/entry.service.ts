import {Injectable} from "@angular/core";
import {ServletService} from "../model/servlet-service";
import {Entry} from "../model/entry";
import {Headers, Http, RequestOptions, RequestOptionsArgs, Response} from "@angular/http";
import {Observable} from "rxjs/Observable";
import {CacheStore} from "../stores/cache.store";
import {EventType} from "../../shop/shared/model/event-type";

@Injectable()
export class EntryService implements ServletService<Entry> {

	constructor(private http: Http,
				private cache: CacheStore) {
	}


	handleError(error: Error): Observable<any> {
		console.error(error);
		return Observable.empty();
	}

	/**
	 *
	 * @param entryId
	 * @param options
	 */
	getById(entryId: number, options?: any): Observable<Entry> {
		let params = new URLSearchParams();
		if (entryId) {
			params.set("entryId", entryId.toString());
		}
		if (options && options.eventId && options.eventType) {
			params.set("eventId", options.eventId.toString());
			params.set("eventType", options.eventType.toString());
		}


		//todo remove when server is running todo demo
		if (entryId !== -1) {
			return this.search("")
				.map(entries => entries.find(entry => entry.id === entryId));
		}

		return this.http.get("/api/entry", {search: params})
			.map(response => response.json().entries)
			.map(json => Entry.create().setProperties(json))
			.do(entry => this.cache.addOrModify(entry))
			//retry 3 times before throwing an error
			.retry(3)
			//log any errors
			.catch(this.handleError)
			//convert the observable to a hot observable, i.e. immediately perform the http request
			//instead of waiting for someone to subscribe
			.publish().refCount();
	}

	/**
	 *
	 * @param eventId
	 * @param eventType
	 */
	getEntriesOfEvent(eventId:number, eventType: EventType):Observable<Entry[]>{
		let params = new URLSearchParams();
		params.set("eventId", eventId.toString());
		params.set("eventType", eventType.toString());

		return this.http.get("/api/entry", {search: params})
			.map(response => response.json().entries)
			.map((jsonArray:any[]) => jsonArray.map(json => Entry.create().setProperties(json)))
			//retry 3 times before throwing an error
			.retry(3)
			//log any errors
			.catch(this.handleError)
			//convert the observable to a hot observable, i.e. immediately perform the http request
			//instead of waiting for someone to subscribe
			.publish().refCount();
	}

	/**
	 *
	 * @param searchTerm
	 * @param options
	 */
	search(searchTerm: string, options?: any): Observable<Entry[]>{
		let params = new URLSearchParams();
		params.set("searchTerm", searchTerm);
		if(options && options.dateRange && options.dateRange.minDate && options.dateRange.maxDate){
			params.set("minDate", options.dateRange.minDate);
			params.set("maxDate", options.dateRange.maxDate);
		}
		let url = `/api/entry`;

		//todo remove when server is running todo demo
		url = `/resources/mock-data/entries.json`;

		return this.http.get(url, {search: params})
			.map(response => response.json().entries)
			.map((jsonArray: any[]) => jsonArray.map(json => Entry.create().setProperties(json)))
			//retry 3 times before throwing an error
			.retry(3)
			//log any errors
			.catch(this.handleError)
			//convert the observable to a hot observable, i.e. immediately perform the http request
			//instead of waiting for someone to subscribe
			.publish().refCount();
	}



	/**
	 * Hilfsmethode um den code übersichtlicher zu gestalten
	 * @param requestMethod
	 * @param entry
	 * @param options
	 * @returns {Observable<T>}
	 */
	private addOrModify(requestMethod: (url: string, body: any, options?: RequestOptionsArgs) => Observable<Response>,
						entry: Entry, options?: any): Observable<Entry>{
		const headers = new Headers({"Content-Type": "application/json"});
		const requestOptions = new RequestOptions({headers});

		return requestMethod("/api/entry", {entry}, requestOptions)
			.map(response => response.json().id)
			.map(id => this.getById(id))
			//retry 3 times before throwing an error
			.retry(3)
			//log any errors
			.catch(this.handleError)
			//convert the observable to a hot observable, i.e. immediately perform the http request
			//instead of waiting for someone to subscribe
			.publish().refCount();
	}


	/**
	 *
	 * @param entry
	 * @param options
	 */
	add(entry: Entry, options?: any): Observable<Entry> {
		return this.addOrModify(this.http.post, entry, options);
	}

	/**
	 *
	 * @param entry
	 * @param options
	 * @returns {Observable<Entry>}
	 */
	modify(entry: Entry, options?: any): Observable<Entry> {
		return this.addOrModify(this.http.put, entry, options);
	}

	/**
	 *
	 * @param id
	 * @param options
	 */
	remove(id: number, options?: any): Observable<Response> {
		return this.http.delete("/api/entry", {body: {id: id}})
		//retry 3 times before throwing an error
			.retry(3)
			//log any errors
			.catch(this.handleError)
			//convert the observable to a hot observable, i.e. immediately perform the http request
			//instead of waiting for someone to subscribe
			.publish().refCount();
	}

}
