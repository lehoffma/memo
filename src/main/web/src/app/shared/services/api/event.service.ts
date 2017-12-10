import {Injectable} from "@angular/core";
import {EventType} from "../../../shop/shared/model/event-type";
import {Event} from "../../../shop/shared/model/event";
import {EventFactoryService} from "../event-factory.service";
import {Tour} from "../../../shop/shared/model/tour";
import {Party} from "../../../shop/shared/model/party";
import {AddOrModifyRequest, AddOrModifyResponse, ServletService} from "./servlet.service";
import {Merchandise} from "../../../shop/shared/model/merchandise";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs/Observable";
import {map, share, tap, mergeMap} from "rxjs/operators";

interface EventApiResponse {
	shopItems: (Party | Merchandise | Tour)[];
}

@Injectable()
export class EventService extends ServletService<Event> {
	private readonly baseUrl = `/api/event`;

	constructor(private http: HttpClient) {
		super();
	}

	/**
	 * Helper method to convert the type value to the appropriate factory function
	 * @param {any | any | any} type
	 * @returns {(() => Party) | (() => Tour) | (() => Merchandise) | (() => Event)}
	 */
	private getFactoryFromType(type: 1 | 2 | 3): (() => Party) | (() => Tour) | (() => Merchandise) | (() => Event) {
		switch (type) {
			case 1:
				return Tour.create;
			case 2:
				return Party.create;
			case 3:
				return Merchandise.create;
		}
		return Event.create;
	}


	/**
	 * Requested das Event (mit einem bestimmten Event-Typen) vom Server, welches die gegebene ID besitzt
	 * @param eventId
	 * @param refresh
	 * @returns {Observable<T>}
	 */
	getById(eventId: number, refresh?: boolean): Observable<Event> {
		const params = new HttpParams().set("id", "" + eventId);
		const request = this.http.get<EventApiResponse>(this.baseUrl, {params})
			.pipe(
				map(json => this.getFactoryFromType(json.shopItems[0]["type"])().setProperties(json.shopItems[0])),
				share()
			);

		return this._cache.getById(params, request);
	}

	/**
	 *
	 * @param userId
	 */
	getHostedEventsOfUser(userId: number): Observable<Event[]> {
		const params = new HttpParams().set("userId", "" + userId);
		const request = this.performRequest(this.http.get<EventApiResponse>(this.baseUrl, {params}))
			.pipe(
				map(json => json.shopItems.map(event =>
					event.setProperties(event))),
				share()
			);

		return this._cache.search(params, request);
	}

	/**
	 * Requested alle Events (mit dem gegebenen event typen), die auf den search term matchen
	 * @param searchTerm
	 * @param eventType
	 * @returns {Observable<T>}
	 */
	search(searchTerm: string, eventType: EventType): Observable<Event[]> {
		const params = new HttpParams().set("searchTerm", searchTerm).set("type", "" + eventType);
		const request = this.performRequest(this.http.get<EventApiResponse>(this.baseUrl, {params}))
			.pipe(
				map(json => json.shopItems.map(event =>
					EventFactoryService.build(eventType).setProperties(event)))
			);

		return this._cache.search(params, request);
	}


	/**
	 * Hilfsmethode um den code übersichtlicher zu gestalten
	 * @param requestMethod
	 * @param event
	 * @param options
	 * @returns {Observable<T>}
	 */
	addOrModify(requestMethod: AddOrModifyRequest,
				event: Event, options?: any): Observable<Event> {
		let body = {};

		if (options) {
			Object.keys(options)
				.filter(key => key !== "uploadedImage")
				.forEach(key => body[key] = options[key]);
		}

		return this.performRequest(requestMethod<AddOrModifyResponse>(this.baseUrl, {event, ...body}))
			.pipe(
				tap(() => this._cache.invalidateById(event.id)),
				mergeMap(response => this.getById(response.id))
			);
	}

	/**
	 * Sendet ein Event Objekt an den Server, welcher dieses zur Datenbank hinzufügen soll. Der Server
	 * gibt dann das erstellte Objekt wieder an den Client zurück
	 * @param event
	 * @param options
	 * @returns {Observable<T>}
	 */
	add(event: Event, options?: any): Observable<Event> {
		return this.addOrModify(this.http.post.bind(this.http), event, options);
	}

	/**
	 * Sendet ein Event Objekt an den Server, welcher dieses mit den übergebeben Daten updaten soll. Der Server
	 * gibt dann das geupdatete Objekt wieder an den Client zurück
	 * @param event
	 * @param options
	 * @returns {Observable<T>}
	 */
	modify(event: Event, options?: any): Observable<Event> {
		return this.addOrModify(this.http.put.bind(this.http), event, options);
	}


	/**
	 * Löscht das Event mit der gegebenen ID aus der Datenbank
	 * @param eventId
	 * @returns {Observable<T>}
	 */
	remove(eventId: number): Observable<AddOrModifyResponse> {
		return this.performRequest(this.http.delete<AddOrModifyResponse>(this.baseUrl, {
			params: new HttpParams().set("id", "" + eventId)
		}))
			.pipe(
				tap(() => this._cache.invalidateById(eventId))
			);
	}

}
