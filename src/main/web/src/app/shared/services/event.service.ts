import {Injectable} from "@angular/core";
import {EventType, getEventTypes} from "../../shop/shared/model/event-type";
import {Observable} from "rxjs/Observable";
import {Event} from "../../shop/shared/model/event";
import {Headers, Http, RequestOptions, Response} from "@angular/http";
import {ServletService} from "../model/servlet-service";
import {EventUtilityService} from "./event-utility.service";
import {EventFactoryService} from "./event-factory.service";
import {Tour} from "../../shop/shared/model/tour";
import {Party} from "../../shop/shared/model/party";
import {CacheStore} from "../stores/cache.store";

@Injectable()
export class EventService implements ServletService<Event> {

	constructor(private http: Http,
				private cache: CacheStore,
				private eventUtilService: EventUtilityService,
				private eventFactoryService: EventFactoryService) {
	}

	handleError(error: Error): Observable<any> {
		console.error(error);
		return Observable.empty();
	}

	private readonly baseUrl = `/api/event`;

	/**
	 * Helper method for accessing the cache
	 * @param eventType
	 * @param id
	 */
	cacheKeyFromEventType(eventType: EventType): "tours" | "partys" | "merch" {
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
	 * @param options
	 * @returns {Observable<T>}
	 */
	getById(eventId: number, options?: { eventType: EventType, refresh?: boolean }): Observable<Event> {
		const {eventType, refresh} = options;

		let url = `${this.baseUrl}?id=${eventId}&type=${eventType}`;

		//return cached version if available to reduce number of http request necessary
		if (this.cache.isCached(this.cacheKeyFromEventType(eventType), eventId) && !refresh) {
			return this.cache.cache[eventType]
				.map((events: Event[]) => events.find(event => event.id === eventId));
		}

		//todo remove when backend is running todo demo
		// if (!refresh) {
		// 	return this.search("", options)
		// 		.map(events => events.find(event => event.id === eventId));
		// }

		return this.http.get(url)
			.map(response => response.json())
			.map(json => this.eventFactoryService.build(eventType).setProperties(json))
			.do(event => this.cache.addOrModify(event))
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
	 * @param userId
	 * @param eventTypes
	 */
	getEventsOfUser(userId: number, eventTypes: { tours?: boolean, partys?: boolean }): Observable<(Tour | Party)[]> {
		let searchQueries: Observable<Event[]>[] = getEventTypes()
			.filter(type => eventTypes[type])
			.map(eventType => this.search("", {eventType}));
		//todo replace with actual method call instead of searching whole database!

		return Observable.combineLatest(searchQueries)
		//combine two observable arrays (one for tours, one for partys) into one
			.map((nestedEventArray: (Tour | Party)[][]) =>
				nestedEventArray.reduce((previous, current) => previous.concat(...current), []))
			//filter out events the given user didn't participate in
			.map((eventArray: (Tour | Party)[]) =>
				eventArray.filter(event => event.participants.some(participant => participant.id === userId)));
	}

	/**
	 * Requested alle Events (mit dem gegebenen event typen), die auf den search term matchen
	 * @param searchTerm
	 * @param options
	 * @returns {Observable<T>}
	 */
	search(searchTerm: string, options?: { eventType: EventType }): Observable<Event[]> {
		const {eventType} = options;

		//if no event type is specified, search for all kinds of events (the default value is 'ALL')
		let url = `${this.baseUrl}?searchTerm=${searchTerm}` + ((eventType !== null) ? `&type=${eventType}` : "");

		//todo remove when backend is running todo demo
		// url = `/resources/mock-data/${eventType}.json`;

		const httpRequest = this.http.get(url)
			.map(response => response.json())
			.map((jsonArray: any[]) => jsonArray.map(json => this.eventFactoryService.build(eventType).setProperties(json)))
			.do(events => this.cache.addMultiple(...events))
			//retry 3 times before throwing an error
			.retry(3)
			//log any errors
			.catch(this.handleError)
			//convert the observable to a hot observable, i.e. immediately perform the http request
			//instead of waiting for someone to subscribe
			.publish().refCount();

		//todo remove when backend is running todo demo
		// const DEBUG_httpRequest = httpRequest.map(events => events.filter(event => event.matchesSearchTerm(searchTerm)));
		let DEBUG_httpRequest = httpRequest;

		const cachedObservable: Observable<Event[]> = this.cache.search(searchTerm, this.cacheKeyFromEventType(eventType));

		//if any of the cached events match the search term, combine these with the ones loaded from the server
		return Observable.combineLatest(cachedObservable, DEBUG_httpRequest,
			(cachedEvents, loadedEvents) => [...cachedEvents, ...loadedEvents]
				.filter((value, index, array) =>
					//removes duplicate entries
					array.findIndex((event: Event) => event.id === value.id && event.title === value.title) === index
				));
	}

	/**
	 * Sendet ein Event Objekt an den Server, welcher dieses zur Datenbank hinzufügen soll. Der Server
	 * gibt dann das erstellte Objekt wieder an den Client zurück
	 * @param event
	 * @param options
	 * @returns {Observable<T>}
	 */
	addOrModify(event: Event, options?: any): Observable<Event> {
		const headers = new Headers({"Content-Type": "application/json"});
		const requestOptions = new RequestOptions({headers});
		const eventType = this.eventUtilService.getEventType(event);

		//todo remove when backend is running todo demo
		// if (eventType) {
		// 	this.cache.addOrModify(event);
		// 	return Observable.of(event);
		// }

		return this.http.post(this.baseUrl, {event}, requestOptions)
			.map(response => response.json())
			.map(eventJson => this.eventFactoryService.build(eventType).setProperties(eventJson))
			.do(event => this.cache.addOrModify(event))
			//retry 3 times before throwing an error
			.retry(3)
			//log any errors
			.catch(this.handleError)
			//convert the observable to a hot observable, i.e. immediately perform the http request
			//instead of waiting for someone to subscribe
			.publish().refCount();
	}


	/**
	 * Löscht das Event mit der gegebenen ID aus der Datenbank
	 * @param eventId
	 * @param options
	 * @returns {Observable<T>}
	 */
	remove(eventId: number, options?: { eventType: EventType }): Observable<Response> {
		const {eventType} = options;

		return this.http.delete(this.baseUrl, {body: {id: eventId, type: eventType}})
			.do((removeResponse: Response) => {
				const eventId: number = removeResponse.json();
				this.cache.remove(this.cacheKeyFromEventType(eventType), eventId);
			})
			//retry 3 times before throwing an error
			.retry(3)
			//log any errors
			.catch(this.handleError)
			//convert the observable to a hot observable, i.e. immediately perform the http request
			//instead of waiting for someone to subscribe
			.publish().refCount();
	}


}
