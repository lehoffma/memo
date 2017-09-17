import {Injectable} from "@angular/core";
import {EventType} from "../../../shop/shared/model/event-type";
import {Observable} from "rxjs/Observable";
import {Event} from "../../../shop/shared/model/event";
import {EventFactoryService} from "../event-factory.service";
import {Tour} from "../../../shop/shared/model/tour";
import {Party} from "../../../shop/shared/model/party";
import {CacheStore} from "../../stores/cache.store";
import {AddOrModifyRequest, AddOrModifyResponse, ServletService} from "./servlet.service";
import {Merchandise} from "../../../shop/shared/model/merchandise";
import {HttpClient, HttpParams} from "@angular/common/http";

interface EventApiResponse {
	events: (Party | Merchandise | Tour)[];
}

@Injectable()
export class EventService extends ServletService<Event> {
	private readonly baseUrl = `/api/event`;

	constructor(private http: HttpClient,
				private cache: CacheStore) {
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
	 * Helper method for accessing the cache
	 * @param eventType
	 */
	private static cacheKeyFromEventType(eventType: EventType): "tours" | "partys" | "merch" {
		switch (eventType) {
			case EventType.tours:
				return "tours";
			case EventType.partys:
				return "partys";
			case EventType.merch:
				return "merch";
		}
		return "tours";
	}


	/**
	 * Requested das Event (mit einem bestimmten Event-Typen) vom Server, welches die gegebene ID besitzt
	 * @param eventId
	 * @param refresh
	 * @returns {Observable<T>}
	 */
	getById(eventId: number, refresh?: boolean): Observable<Event> {
		//return cached version if available to reduce number of http request necessary
		//todo cache test
		let cachedEvent = this.cache.getEventById(eventId);
		if (cachedEvent && !refresh) {
			console.log(`eventId ${eventId} is cached`);
			return Observable.of(cachedEvent);
		}
		console.log(`eventId ${eventId} is not cached, retrieving from db`);

		return this.performRequest(this.http.get<EventApiResponse>(this.baseUrl, {
			params: new HttpParams().set("id", "" + eventId)
		}))
			.map(json => this.getFactoryFromType(json.events[0]["type"])().setProperties(json.events[0]))
			.do(event => this.cache.addOrModify(event))
			.share();
	}

	/**
	 *
	 * @param userId
	 */
	getHostedEventsOfUser(userId: number): Observable<(Tour | Party)[]> {
		return this.performRequest(this.http.get<EventApiResponse>(this.baseUrl, {
			params: new HttpParams().set("userId", "" + userId)
		}))
			.map(json => json.events.map(event =>
				event.setProperties(event)))
			.do(events => this.cache.addMultiple(...events))
			.share()
	}

	/**
	 * Requested alle Events (mit dem gegebenen event typen), die auf den search term matchen
	 * @param searchTerm
	 * @param eventType
	 * @returns {Observable<T>}
	 */
	search(searchTerm: string, eventType: EventType): Observable<Event[]> {
		const httpRequest = this.performRequest(this.http.get<EventApiResponse>(this.baseUrl, {
			params: new HttpParams().set("searchTerm", searchTerm).set("type", "" + eventType)
		}))
			.map(json => json.events.map(event =>
				EventFactoryService.build(eventType).setProperties(event)))
			.do(events => this.cache.addMultiple(...events));

		//todo just use the cached one instead of combining them?
		//todo cache search result instead of searching cached events?
		const cachedObservable: Observable<Event[]> = this.cache
			.search(searchTerm, EventService.cacheKeyFromEventType(eventType));

		//if any of the cached events match the search term, combine these with the ones loaded from the server
		return Observable.combineLatest(cachedObservable, httpRequest,
			(cachedEvents, loadedEvents) => [...cachedEvents, ...loadedEvents]
				.filter((value, index, array) =>
					//removes duplicate entries
					array.findIndex((event: Event) => event.id === value.id && event.title === value.title) === index
				))
			.share()
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
			.flatMap(response => this.getById(response.id));
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
			.do(response => {
				this.cache.remove(EventService.cacheKeyFromEventType(EventType.merch), response.id);
			});
	}


}
