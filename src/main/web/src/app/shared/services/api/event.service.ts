import {Injectable} from "@angular/core";
import {EventType, integerToType, typeToInteger} from "../../../shop/shared/model/event-type";
import {Event} from "../../../shop/shared/model/event";
import {createTour, Tour} from "../../../shop/shared/model/tour";
import {createParty, Party} from "../../../shop/shared/model/party";
import {AddOrModifyRequest, AddOrModifyResponse, ServletService} from "./servlet.service";
import {createMerch, Merchandise} from "../../../shop/shared/model/merchandise";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {mergeMap, tap} from "rxjs/operators";
import {Filter} from "../../model/api/filter";
import {PageRequest} from "../../model/api/page-request";
import {Sort} from "../../model/api/sort";
import {Page} from "../../model/api/page";
import {isUser} from "../../model/util/model-type-util";
import {setProperties} from "../../model/util/base-object";
import {CapacityService} from "./capacity.service";
import {StockService} from "./stock.service";
import {UserService} from "./user.service";
import {MerchColor} from "../../../shop/shared/model/merch-color";
import {ApiCache} from "../../utility/cache/api-cache";

@Injectable()
export class EventService extends ServletService<Event> {
	constructor(protected http: HttpClient,
				private capacityService: CapacityService,
				private userService: UserService,
				private stockService: StockService) {
		super(http, `/api/event`);
	}

	jsonToObject(json: any): Event {
		return setProperties(this.getFactoryFromType((json["type"]))(), json);
	}

	urlCaches = {
		sizes: new ApiCache<string>(),
		colors: new ApiCache<MerchColor>(),
		materials: new ApiCache<string>()
	};

	getByUrl<ReturnType>(cache: ApiCache<ReturnType>, url: string, filter: Filter): Observable<ReturnType[]> {
		const params = this.buildParams(filter, PageRequest.all(), Sort.none());
		const request = this.performRequest(this.http.get<ReturnType[]>(url, {params}));

		return cache.other(params, request);
	}

	getSizes(filter: Filter): Observable<string[]> {
		return this.getByUrl(this.urlCaches.sizes, "/api/event/sizes", filter);
	}

	getColors(filter: Filter): Observable<MerchColor[]> {
		return this.getByUrl(this.urlCaches.colors, "/api/event/colors", filter);
	}

	getMaterials(filter: Filter): Observable<string[]> {
		return this.getByUrl(this.urlCaches.materials, "/api/event/materials", filter);
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
			Filter.by({"type": "" + typeToInteger(eventType)}),
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

		const allowedAttributes = ["priceMember", "expectedReadRole", "duration", "orders", "material", "price", "expectedCheckInRole",
			"vehicle", "date", "entries", "comments", "stock", "title", "capacity", "id", "description", "expectedWriteRole",
			"miles", "route", "author", "images", "type", "groupPicture", "reportWriters", "paymentLimit", "paymentMethods"];
		let modifiedEvent = {...event};
		Object.keys(modifiedEvent).forEach(attr => {
			if (!allowedAttributes.includes(attr)) {
				delete modifiedEvent[attr];
			}
		});

		if (modifiedEvent.author.length > 0 && isUser(modifiedEvent.author[0])) {
			modifiedEvent.author = modifiedEvent.author.map(it => it["id"]);
		}

		return this.performRequest(requestMethod<AddOrModifyResponse>(this.baseUrl, {event: modifiedEvent, ...body}))
			.pipe(
				tap(() => this._cache.invalidateById(event.id)),
				mergeMap(response => this.getById(response.id)),
				tap(() => this.updateCapacities(modifiedEvent))
			);
	}


	/**
	 *
	 * @param event
	 */
	updateCapacities(event: Event) {
		this.capacityService.invalidateValue(event.id);
		if (integerToType(event.type) === EventType.merch) {
			this.stockService.invalidateValue(event.id);
		}
		event.author.forEach(id => this.userService.invalidateValue(id));
	}

	/**
	 * Helper method to convert the type value to the appropriate factory function
	 * @param {any | any | any} type
	 * @returns {(() => Party) | (() => Tour) | (() => Merchandise) | (() => Event)}
	 */
	private getFactoryFromType(type: 1 | 2 | 3): (() => Party) | (() => Tour) | (() => Merchandise) | (() => Event) {
		switch (type) {
			case 1:
				return createTour;
			case 2:
				return createParty;
			case 3:
				return createMerch;
		}
		return null;
	}

}
