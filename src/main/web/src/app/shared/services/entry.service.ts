import {Injectable} from "@angular/core";
import {ServletService} from "../model/servlet-service";
import {Entry} from "../model/entry";
import {Headers, Http, RequestOptions, Response} from "@angular/http";
import {Observable} from "rxjs/Observable";

@Injectable()
export class EntryService implements ServletService<Entry> {
	constructor(private http: Http) {
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
		const {eventId} = options;
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

		return this.http.get(url)
			.map(response => response.json())
			.map(json => Entry.create().setProperties(json))
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
	search(searchTerm: string, options?: any): Observable<Entry[]> {
		const {dateRange: {minDate, maxDate}} = options;
		let url = `/api/entry?searchTerm=${searchTerm}`;
		if (minDate && maxDate) {
			url += `&minDate=${minDate}&maxDate=${maxDate}`
		}

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
	 */
	addOrModify(entry: Entry): Observable<Entry> {
		const headers = new Headers({"Content-Type": "application/json"});
		const options = new RequestOptions({headers});

		return this.http.post(`/api/entry`, {entry}, options)
			.map(response => response.json())
			//todo flatMap to this.get(id)
			.map(userJson => Entry.create().setProperties(userJson))
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
