import {Injectable} from '@angular/core';
import {AddOrModifyResponse, ServletService} from "./servlet.service";
import {Order} from "../../model/order";
import {Observable} from "rxjs/Observable";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {CacheStore} from "app/shared/stores/cache.store";

interface OrderApiResponse {
	orders: Order[];
}

@Injectable()
export class OrderService extends ServletService<Order> {
	baseUrl = "/api/order";

	constructor(public http: HttpClient,
				private cache: CacheStore) {
		super();
	}

	/**
	 *
	 * @param {number} id
	 * @returns {Observable<Order>}
	 */
	getById(id: number): Observable<Order> {
		if(this.cache.isCached("orders", id)){
			console.log(`orderId ${id} is cached`);
			return this.cache.cache.orders
				.map(orders => orders.find(order => order.id === id));
		}
		console.log(`orderId ${id} is not cached, retrieving from db`);

		return this.http.get<OrderApiResponse>(this.baseUrl, {
			params: new HttpParams().set("id", "" + id)
		})
		//todo error handling
			.map(response => response.orders[0])
			.map(order => Order.create().setProperties(order))
			.do(order => this.cache.addOrModify(order))
	}

	/**
	 *
	 * @param {string} searchTerm
	 * @returns {Observable<Order[]>}
	 */
	search(searchTerm: string): Observable<Order[]> {
		return this.http.get<OrderApiResponse>(this.baseUrl, {
			params: new HttpParams().set("searchTerm", searchTerm)
		})
			.map(response => response.orders)
			.map(orders => orders.map(order => Order.create().setProperties(order)))
			.do(orders => this.cache.addMultiple(...orders));
	}

	/**
	 *
	 * @param {number} userId
	 * @returns {Observable<Order[]>}
	 */
	getByUserId(userId: number): Observable<Order[]> {
		return this.http.get<OrderApiResponse>(this.baseUrl, {
			params: new HttpParams().set("userId", "" + userId)
		})
			.map(response => response.orders)
			.map(orders => orders.map(order => Order.create().setProperties(order)))
			.do(orders => this.cache.addMultiple(...orders));
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
			.flatMap(response => this.getById(response.id));
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
			.flatMap(response => this.getById(response.id));
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
			.do(response => this.cache.remove("orders", id))
	}
}
