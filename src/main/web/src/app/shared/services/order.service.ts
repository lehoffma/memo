import {Injectable} from '@angular/core';
import {ServletService} from "./servlet.service";
import {Order} from "../model/order";
import {Observable} from "rxjs/Observable";
import {Headers, Http, RequestOptions, Response} from "@angular/http";
import {PaymentMethod} from "../../shop/checkout/payment/payment-method";

@Injectable()
export class OrderService extends ServletService<Order>{
	baseUrl= "/api/order";

	constructor(public http:Http) {
		super();
	}

	/**
	 *
	 * @param {number} id
	 * @returns {Observable<Order>}
	 */
	getById(id: number): Observable<Order> {
		let queryParams = new URLSearchParams();
		queryParams.set("id", ""+id);

		return this.http.get(this.baseUrl, {search: queryParams})
			.map(response => response.json().orders[0] as Order);
	}

	/**
	 *
	 * @param {string} searchTerm
	 * @returns {Observable<Order[]>}
	 */
	search(searchTerm: string): Observable<Order[]> {
		let queryParams = new URLSearchParams();
		queryParams.set("searchTerm", searchTerm);

		return this.http.get(this.baseUrl, {search: queryParams})
			.map(response => response.json().orders as Order[]);
	}

	/**
	 *
	 * @param {number} userId
	 * @returns {Observable<Order[]>}
	 */
	getByUserId(userId:number): Observable<Order[]>{
		let queryParams = new URLSearchParams();
		queryParams.set("userId", ""+userId);

		return this.http.get(this.baseUrl, {search: queryParams})
			.map(response => response.json().orders as Order[]);
	}

	/**
	 *
	 * @param {Order} order
	 * @param args
	 * @returns {Observable<Order>}
	 */
	add(order: Order): Observable<Order> {
		const headers = new Headers({"Content-Type": "application/json"});
		const requestOptions = new RequestOptions({headers});

		return this.http.post(this.baseUrl, {order}, requestOptions)
			.map(response => response.json() as number)
			.flatMap(accountId => this.getById(accountId));
	}

	/**
	 *
	 * @param {Order} order
	 * @returns {Observable<Order>}
	 */
	modify(order: Order): Observable<Order> {
		const headers = new Headers({"Content-Type": "application/json"});
		const requestOptions = new RequestOptions({headers});

		return this.http.put(this.baseUrl, {order}, requestOptions)
			.map(response => response.json() as number)
			.flatMap(accountId => this.getById(accountId));
	}

	/**
	 *
	 * @param {number} id
	 * @returns {Observable<Response>}
	 */
	remove(id: number): Observable<Response> {
		return this.http.delete(this.baseUrl, {body: id});
	}
}
