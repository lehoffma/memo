import {Injectable} from "@angular/core";
import {AddOrModifyRequest, AddOrModifyResponse, ServletService} from "./servlet.service";
import {createOrder, Order} from "../../model/order";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";
import {map, mergeMap, tap} from "rxjs/operators";
import {CapacityService} from "./capacity.service";
import {StockService} from "./stock.service";
import {Event} from "../../../shop/shared/model/event";
import {EventType, typeToInteger} from "../../../shop/shared/model/event-type";
import {Filter} from "../../model/api/filter";
import {PageRequest} from "../../model/api/page-request";
import {Direction, Sort} from "../../model/api/sort";
import {Page} from "../../model/api/page";
import {setProperties} from "../../model/util/base-object";
import {DiscountService} from "../../../shop/shared/services/discount.service";
import {OrderedItem} from "../../model/ordered-item";
import {OrderStatus} from "../../model/order-status";

@Injectable()
export class OrderService extends ServletService<Order> {
	completedOrder: number = null;

	constructor(protected http: HttpClient,
				private stockService: StockService,
				private discountService: DiscountService,
				private capacityService: CapacityService) {
		super(http, "/api/order");
	}


	jsonToObject(json: any): Order {
		return setProperties(createOrder(), json);
	}

	/**
	 *
	 * @param {number} id
	 * @param pageRequest
	 * @param sort
	 * @returns {Observable<Order>}
	 */
	getByOrderedItemId(id: number, pageRequest: PageRequest, sort: Sort): Observable<Page<Order>> {
		return this.get(
			Filter.by({"orderedItemId": "" + id}),
			pageRequest,
			sort
		);
	}


	getOrdersForShopItem(itemId: number, userId: number): Observable<Order[]>{
		return this.get(
			Filter.by({"userId": "" + userId, "eventId": "" + itemId}),
			PageRequest.all(),
			Sort.by(Direction.DESCENDING, "timeStamp")
		)
			.pipe(
				map(it => it.content),
			)
	}

	/**
	 *
	 * @param {number} userId
	 * @param pageRequest
	 * @param sort
	 * @returns {Observable<Order[]>}
	 */
	getByUserId(userId: number, pageRequest: PageRequest, sort: Sort): Observable<Page<Order>> {
		return this.get(
			Filter.by({"userId": "" + userId}),
			pageRequest,
			sort
		);
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

		items.forEach(item => this.discountService.invalidateEventDiscounts(item.id, order.user));
	}

	addOrModify(requestMethod: AddOrModifyRequest, entry: Order, options?: any): Observable<Order> {
		return undefined;
	}
}
