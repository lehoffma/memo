import {Injectable} from "@angular/core";
import {ApiCache} from "../../../shared/cache/api-cache";
import {Permission} from "../../../shared/model/permission";
import {HttpClient, HttpParams} from "@angular/common/http";
import {catchError, map, mergeMap, retry} from "rxjs/operators";
import {Observable, of} from "rxjs";
import {Discount} from "../../../shared/renderers/price-renderer/discount";
import {EventService} from "../../../shared/services/api/event.service";

@Injectable()
export class DiscountService {
	protected _cache: ApiCache<Permission> = new ApiCache<Permission>();
	private baseUrl = "/api/discounts";

	constructor(private http: HttpClient,
				private eventService: EventService) {
	}

	/**
	 *
	 * @param {number} userId
	 * @returns {Observable<Discount[]>}
	 */
	getUserDiscounts(userId?: number): Observable<Discount[]> {
		let params = new HttpParams();
		if (userId) {
			params = params.set("userId", "" + userId);
		}
		const request = this.request(this.http.get<{ discounts: Discount[] }>(this.baseUrl, {params}))
			.pipe(map(response => response.discounts));

		return this._cache.other(params, request);
	}

	/**
	 *
	 * @param {number} eventId
	 * @param {number} userId
	 * @returns {Observable<Discount[]>}
	 */
	getEventDiscounts(eventId: number, userId?: number): Observable<Discount[]> {
		let params = new HttpParams()
			.set("eventId", "" + eventId);
		if (userId) {
			params = params.set("userId", "" + userId);
		}
		let request = this.request(this.http.get<{ discounts: Discount[] }>(this.baseUrl, {params}))
			.pipe(map(response => response.discounts));

		return this._cache.other(params, request);
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

	/**
	 *
	 * @param {Discount[]} discounts
	 * @returns {number}
	 */
	getTotalDiscount(discounts: Discount[]): number {
		if (!discounts) {
			return 0;
		}
		return discounts
			.filter(discount => discount.eligible)
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
		return Math.max(basePrice - this.getTotalDiscount(discounts), 0);
	}

	/**
	 *
	 * @param error
	 * @returns {any}
	 */
	private handleError(error: Error): Observable<any> {
		console.error(error);
		return of(error);
	}

	/**
	 *
	 * @param requestObservable
	 * @returns {Observable<T>}
	 */
	private request<U>(requestObservable: Observable<U>): Observable<U> {
		return requestObservable
			.pipe(
				//retry 2 times before throwing an error
				retry(2),
				//log any errors
				catchError(error => this.handleError(error))
			)
	}
}
