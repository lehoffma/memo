import {Injectable} from "@angular/core";
import {EventType} from "../../../shop/shared/model/event-type";
import {Event} from "../../../shop/shared/model/event";
import {Tour} from "../../../shop/shared/model/tour";
import {Party} from "../../../shop/shared/model/party";
import {AddOrModifyRequest, AddOrModifyResponse, ServletService} from "./servlet.service";
import {Merchandise} from "../../../shop/shared/model/merchandise";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs/Observable";
import {mergeMap, tap} from "rxjs/operators";
import {User} from "../../model/user";
import {Filter} from "../../model/api/filter";
import {PageRequest} from "../../model/api/page-request";
import {Sort} from "../../model/api/sort";
import {Page} from "../../model/api/page";

@Injectable()
export class EventService extends ServletService<Event> {
	constructor(protected http: HttpClient) {
		super(http, `/api/event`);
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


	jsonToObject(json: any): Event {
		return this.getFactoryFromType((json["type"]))().setProperties(json);
	}

	/**
	 *
	 * @param userId
	 * @param pageRequest
	 * @param sort
	 */
	getHostedEventsOfUser(userId: number, pageRequest: PageRequest, sort: Sort): Observable<Page<Event>> {
		return this.get(
			Filter.by({"authorId": "" + userId}),
			pageRequest,
			sort
		);
	}

	/**
	 *
	 * @param {EventType} eventType
	 * @param pageRequest
	 * @param sort
	 * @param pageRequest
	 * @param sort
	 * @returns {Observable<Event[]>}
	 */
	getByEventType(eventType: EventType, pageRequest: PageRequest, sort: Sort): Observable<Page<Event>> {
		return this.get(
			Filter.by({"type": "" + eventType}),
			pageRequest,
			sort
		);
	}

	/**
	 * Requested alle Events (mit dem gegebenen event typen), die auf den search term matchen
	 * @param searchTerm
	 * @param pageRequest
	 * @param sort
	 * @returns {Observable<T>}
	 */
	search(searchTerm: string, pageRequest: PageRequest, sort: Sort): Observable<Page<Event>> {
		return this.get(
			Filter.by({"searchTerm": searchTerm}),
			pageRequest,
			sort
		);
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

		const allowedAttributes = ["priceMember", "expectedReadRole", "orders", "material", "price", "expectedCheckInRole",
			"vehicle", "date", "entries", "comments", "stock", "title", "capacity", "id", "description", "expectedWriteRole",
			"miles", "route", "author", "images", "type", "groupPicture", "reportWriters"];
		let modifiedEvent = {...event};
		Object.keys(modifiedEvent).forEach(attr => {
			if (!allowedAttributes.includes(attr)) {
				delete modifiedEvent[attr];
			}
		});

		if (modifiedEvent.author.length > 0 && User.isUser(modifiedEvent.author[0])) {
			modifiedEvent.author = modifiedEvent.author.map(it => it["id"]);
		}

		return this.performRequest(requestMethod<AddOrModifyResponse>(this.baseUrl, {event: modifiedEvent, ...body}))
			.pipe(
				tap(() => this._cache.invalidateById(event.id)),
				mergeMap(response => this.getById(response.id))
			);
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
				tap(() => this._cache.invalidateById(eventId)),
			);
	}

}
