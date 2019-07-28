import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {map, mergeMap, tap} from "rxjs/operators";
import {Observable} from "rxjs";
import {Discount, getDiscountedPrice} from "../../../shared/renderers/price-renderer/discount";
import {EventService} from "../../../shared/services/api/event.service";
import {AddOrModifyResponse, ServletService} from "../../../shared/services/api/servlet.service";
import {Filter} from "../../../shared/model/api/filter";
import {PageRequest} from "../../../shared/model/api/page-request";
import {Direction, Sort} from "../../../shared/model/api/sort";

@Injectable()
export class DiscountService extends ServletService<Discount> {
	constructor(protected http: HttpClient,
				protected  eventService: EventService) {
		super(http, "/api/discounts")
	}


	addOrModify(requestMethod: <T>(url: string, body: (any | null), options?: { headers?: HttpHeaders; observe?: "body"; params?: HttpParams; reportProgress?: boolean; responseType?: "json"; withCredentials?: boolean }) => Observable<T>, entry: Discount, options?: any): Observable<Discount> {
		return this.performRequest(requestMethod<AddOrModifyResponse>(this.baseUrl, {discount: entry}, {
			headers: new HttpHeaders().set("Content-Type", "application/json")
		}))
			.pipe(
				tap(response => this._cache.invalidateById(response.id)),
				mergeMap(response => this.getById(response.id))
			);
	}

	deactivate(discount: Discount): Observable<any> {
		const copy = {...discount};
		copy.outdated = true;
		return this.modify(copy);
	}


	/**
	 *
	 * @param {number} userId
	 * @returns {Observable<Discount[]>}
	 */
	getUserDiscounts(userId?: number): Observable<Discount[]> {
		return this.getPagedForCustomUrl(
			"/api/discounts/get",
			Filter.by({userId: "" + userId}),
			PageRequest.all(),
			Sort.by(Direction.DESCENDING, "id")
		).pipe(
			map(it => it.content)
		);
	}

	/**
	 *
	 * @param {number} itemId
	 * @param {number} userId
	 * @returns {Observable<Discount[]>}
	 */
	getEventDiscounts(itemId: number, userId?: number): Observable<Discount[]> {
		let filter = Filter.by({itemId: "" + itemId});
		if (userId !== undefined && userId !== null) {
			filter = Filter.combine(
				filter,
				Filter.by({userId: "" + userId})
			);
		}

		return this.getPagedForCustomUrl(
			"/api/discounts/get",
			filter,
			PageRequest.all(),
			Sort.by(Direction.DESCENDING, "id")
		).pipe(
			map(it => it.content)
		);
	}

	getEventDiscountPossibilities(itemId: number, userId?: number): Observable<Discount[]> {
		let filter = Filter.by({itemId: "" + itemId});
		if (userId !== undefined) {
			filter = Filter.combine(
				filter,
				Filter.by({userId: "" + userId})
			);
		}

		return this.getPagedForCustomUrl(
			"/api/discounts/getPossibilities",
			// "/api/discounts/get",
			filter,
			PageRequest.all(),
			Sort.by(Direction.DESCENDING, "id")
		).pipe(
			map(it => it.content)
		);
	}

	invalidateEventDiscounts(eventId: number, userId?: number) {
		let params = new HttpParams()
			.set("eventId", "" + eventId);
		if (userId) {
			params = params.set("userId", "" + userId);
		}
		this._cache.invalidateByPartialParams(params);
	}

	/**
	 *
	 * @param {number} eventId
	 * @param eventPrice
	 * @param {number} userId
	 * @returns {Observable<number>}
	 */
	calculateDiscountedPriceOfEvent(eventId: number, eventPrice: number, userId?: number): Observable<number> {
		return this.getEventDiscounts(eventId, userId)
			.pipe(
				map(discounts => this.getDiscountedPrice(eventPrice, discounts))
			);
	}

	/**
	 *
	 * @param {number} eventId
	 * @param eventPrice
	 * @param {number} userId
	 * @returns {Observable<number>}
	 */
	getDiscountedPriceOfEvent(eventId: number, userId?: number): Observable<number> {
		return this.getEventDiscounts(eventId, userId)
			.pipe(
				mergeMap(discounts => this.eventService.getById(eventId)
					.pipe(
						map(item => this.getDiscountedPrice(item.price, discounts))
					)
				)
			);
	}

	getPrices(eventId: number, userId?: number): Observable<{ discounted: number; normal: number }> {
		return this.getEventDiscounts(eventId, userId)
			.pipe(
				mergeMap(discounts => this.eventService.getById(eventId)
					.pipe(
						map(item => ({
							discounted: this.getDiscountedPrice(item.price, discounts),
							normal: item.price
						}))
					)
				)
			);
	}


	/**
	 * Calculates the reduced price according to the array of discounts given.
	 * Non-eligible discounts are ignored
	 * @param {number} basePrice
	 * @param {Discount[]} discounts
	 * @returns {number}
	 */
	getDiscountedPrice(basePrice: number, discounts: Discount[]): number {
		return getDiscountedPrice(basePrice, discounts);
	}

}
