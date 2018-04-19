import {Injectable} from "@angular/core";
import {AddOrModifyResponse, ServletService} from "./servlet.service";
import {Order} from "../../model/order";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs/Observable";
import {map, mergeMap, tap} from "rxjs/operators";
import {CapacityService} from "./capacity.service";
import {StockService} from "./stock.service";
import {Event} from "../../../shop/shared/model/event";
import {EventType, typeToInteger} from "../../../shop/shared/model/event-type";

interface OrderApiResponse {
	orders: Order[];
}

@Injectable()
export class OrderService extends ServletService<Order> {
	private baseUrl = "/api/order";
	completedOrder: number = null;

	constructor(public http: HttpClient,
				private stockService: StockService,
				private capacityService: CapacityService) {
		super();
	}

	/**
	 *
	 * @param {number} id
	 * @returns {Observable<Order>}
	 */
	getById(id: number): Observable<Order> {
		const params = new HttpParams().set("id", "" + id);
		const request = this.performRequest(this.http.get<OrderApiResponse>(this.baseUrl, {params}))
			.pipe(
				map(response => response.orders[0]),
				map(order => Order.create().setProperties(order))
			);

		return this._cache.getById(params, request);
	}

	/**
	 *
	 * @param {number} id
	 * @returns {Observable<Order>}
	 */
	getByOrderedItemId(id: number): Observable<Order> {
		const params = new HttpParams().set("orderedItemId", "" + id);
		const request = this.performRequest(this.http.get<OrderApiResponse>(this.baseUrl, {params}))
			.pipe(
				map(response => response.orders[0]),
				map(order => Order.create().setProperties(order))
			);

		return this._cache.getById(params, request);
	}

	/**
	 *
	 * @param {string} searchTerm
	 * @returns {Observable<Order[]>}
	 */
	search(searchTerm: string): Observable<Order[]> {
		const params = new HttpParams().set("searchTerm", searchTerm);
		const request = this.performRequest(this.http.get<OrderApiResponse>(this.baseUrl, {params}))
			.pipe(
				map(response => response.orders),
				map(orders => orders.map(order => Order.create().setProperties(order)))
			);

		return this._cache.search(params, request);
	}

	/**
	 *
	 * @param {number} userId
	 * @returns {Observable<Order[]>}
	 */
	getByUserId(userId: number): Observable<Order[]> {
		const params = new HttpParams().set("userId", "" + userId);
		const request = this.performRequest(this.http.get<OrderApiResponse>(this.baseUrl, {params}))
			.pipe(
				map(response => response.orders),
				map(orders => orders.map(order => Order.create().setProperties(order)))
			);

		return this._cache.search(params, request);
	}


	/**
	 *
	 * @param {Order} order
	 * @param args
	 * @returns {Observable<Order>}
	 */
	add(order: Order): Observable<Order> {
		return this.http.post<AddOrModifyResponse>(this.baseUrl, {order}, {
			headers: new HttpHeaders().set("Content-Type", "application/json")
		})
			.pipe(
				tap(() => this._cache.invalidateAll()),
				mergeMap(response => this.getById(response.id)),
				//invalidate capacity values of every ordered item
				tap((newOrder) => this.updateCapacities(newOrder)),
			);
	}

	/**
	 *
	 * @param {Order} order
	 * @returns {Observable<Order>}
	 */
	modify(order: Order): Observable<Order> {
		return this.http.put<AddOrModifyResponse>(this.baseUrl, {order}, {
			headers: new HttpHeaders().set("Content-Type", "application/json")
		})
			.pipe(
				tap(() => this.invalidateValue(order.id)),
				mergeMap(response => this.getById(response.id)),
				//invalidate capacity values of every ordered item
				tap(modifiedOrder => this.updateCapacities(modifiedOrder)),
			);
	}

	/**
	 *
	 * @param {number} id
	 * @returns {Observable<Object>}
	 */
	remove(id: number): Observable<Object> {
		return this.http.delete(this.baseUrl, {
			params: new HttpParams().set("id", "" + id)
		})
			.pipe(
				tap(() => this._cache.invalidateById(id)),
			);
	}

	/**
	 *
	 * @param {Order} order
	 */
	updateCapacities(order: Order) {
		const items: Event[] = Array.from(new Set(order.items.map(it => it.item)));
		//for tours/partys: invalidate capacity
		items
			.filter(item => item.type !== typeToInteger(EventType.merch))
			.map(item => item.id)
			.forEach(id => this.capacityService.invalidateValue(id));

		//for merch: invalidate stock
		items
			.filter(item => item.type === typeToInteger(EventType.merch))
			.map(item => item.id)
			.forEach(id => this.stockService.invalidateValue(id));
	}
}
