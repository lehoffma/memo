import {Injectable} from "@angular/core";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {map, mergeMap} from "rxjs/operators";
import {Observable} from "rxjs";
import {Discount} from "../../../shared/renderers/price-renderer/discount";
import {EventService} from "../../../shared/services/api/event.service";
import {ServletService} from "../../../shared/services/api/servlet.service";
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
		//todo allow creating discounts once the infrastructure around it has been changed
		return undefined;
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
			// "/api/discounts/getPossibilities",
			"/api/discounts/get",
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
	 *
	 * @param {Discount[]} discounts
	 * @returns {number}
	 */
	private getTotalDiscount(discounts: Discount[]): number {
		if (!discounts) {
			return 0;
		}
		return discounts
			.reduce((acc, discount) => acc + discount.amount, 0);
	}

	/**
	 * Calculates the reduced price according to the array of discounts given.
	 * Non-eligible discounts are ignored
	 * @param {number} basePrice
	 * @param {Discount[]} discounts
	 * @returns {number}
	 */
	getDiscountedPrice(basePrice: number, discounts: Discount[]): number {
		discounts
		//non-percentage discounts first, then sort by id
			.sort((a, b) => {
				if (a.isPercentage === b.isPercentage) {
					return b.id - a.id;
				}

				if (a.isPercentage && !b.isPercentage) {
					return -1;
				}
				if (!a.isPercentage && b.isPercentage) {
					return 1;
				}
				return 0;
			})
			.reduce((price, discount) => {
				if (discount.isPercentage) {
					return price - price * discount.amount;
				}
				return price - discount.amount;
			}, basePrice);

		return Math.max(basePrice - this.getTotalDiscount(discounts), 0);
	}

}
