import {Injectable} from "@angular/core";
import {ApiCache} from "../../../shared/cache/api-cache";
import {Permission} from "../../../shared/model/permission";
import {HttpClient, HttpParams} from "@angular/common/http";
import {catchError, map, retry} from "rxjs/operators";
import {Observable} from "rxjs/Observable";
import {of} from "rxjs/observable/of";
import {Discount} from "../../../shared/price-renderer/discount";

@Injectable()
export class DiscountService {
	protected _cache: ApiCache<Permission> = new ApiCache<Permission>();
	private baseUrl = "/api/discounts";

	constructor(private http: HttpClient) {
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
		const request = this.request(this.http.get<Discount[]>(this.baseUrl, {params}));

		return this._cache.other(params, request);
	}

	/**
	 *
	 * @param {number} eventId
	 * @param {number} userId
	 * @returns {Observable<Discount[]>}
	 */
	getEventDiscounts(eventId: number, userId?: number): Observable<Discount[]> {
		//todo remove demo
		if (eventId !== -500) {
			console.warn("discount service demo");
			return of([
				{
					amount: 5,
					eligible: true,
					link: {
						url: "/applyForMembership",
						text: "Werde jetzt Mitglied, um 5 Euro auf alle Touren zu sparen!"
					},
					reason: "Mitglieder-Rabatt"
				}
			])
		}

		let params = new HttpParams()
			.set("eventId", "" + eventId);
		if (userId) {
			params = params.set("userId", "" + userId);
		}
		const request = this.request(this.http.get<Discount[]>(this.baseUrl, {params}));

		return this._cache.other(params, request);
	}

	/**
	 *
	 * @param {number} eventId
	 * @param eventPrice
	 * @param {number} userId
	 * @returns {Observable<number>}
	 */
	getDiscountedPriceOfEvent(eventId: number, eventPrice: number, userId?: number): Observable<number> {
		return this.getEventDiscounts(eventId, userId)
			.pipe(
				map(discounts => this.getDiscountedPrice(eventPrice, discounts))
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
		return basePrice - this.getTotalDiscount(discounts);
	}
}
