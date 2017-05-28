import {Injectable} from "@angular/core";
import {ServletService} from "../model/servlet-service";
import {Entry} from "../model/entry";
import {Headers, Http, RequestOptions, Response} from "@angular/http";
import {Observable} from "rxjs/Observable";
import {CacheStore} from "../stores/cache.store";

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
		let eventId;
		if(options && options.eventId){
			eventId = options.eventId;
		}

		let url = `/api/entry?`;
		if (entryId) {
			url += `entryId=${entryId}`
		}
		if (entryId && eventId) {
			url += "&";
		}
		if (eventId) {
			url += `eventId=${eventId}`
		}


		//todo remove when server is running todo demo
		if (entryId !== -1) {
			return this.search("")
				.map(entries => entries.find(entry => entry.id === entryId));
		}

		return this.http.get(url)
			.map(response => response.json())
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
	 * @param searchTerm
	 * @param options
	 */
	search(searchTerm: string, options?: any): Observable<Entry[]>{
		let minDate, maxDate;
		if(options && options.dateRange && options.dateRange.minDate && options.dateRange.maxDate){
			minDate = options.dateRange.minDate;
			maxDate = options.dateRange.maxDate;
		}
		let url = `/api/entry?searchTerm=${searchTerm}`;
		if (minDate && maxDate) {
			url += `&minDate=${minDate}&maxDate=${maxDate}`
		}

		//todo remove when server is running todo demo
		url = `/resources/mock-data/entries.json`;

		return this.http.get(url)
			.map(response => response.json())
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
	 *
	 * @param entry
	 * @param options
	 */
	addOrModify(entry: Entry, options?: any): Observable<Entry> {
		const headers = new Headers({"Content-Type": "application/json"});
		const requestOptions = new RequestOptions({headers});

		return this.http.post(`/api/entry`, {entry}, requestOptions)
			.map(response => response.json())
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
