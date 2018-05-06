import {Injectable} from "@angular/core";
import {EventType, typeToInteger} from "../../../shop/shared/model/event-type";
import {Participant, ParticipantUser} from "../../../shop/shared/model/participant";
import {UserService} from "./user.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {AddOrModifyRequest, AddOrModifyResponse, ServletService} from "./servlet.service";
import {Tour} from "../../../shop/shared/model/tour";
import {Party} from "../../../shop/shared/model/party";
import {Merchandise} from "../../../shop/shared/model/merchandise";
import {EventUtilityService} from "../event-utility.service";
import {of} from "rxjs/observable/of";
import {Observable} from "rxjs/Observable";
import {map, mergeMap, share, tap} from "rxjs/operators";
import {combineLatest} from "rxjs/observable/combineLatest";
import {OrderService} from "./order.service";
import {Order} from "../../model/order";
import {PaymentMethod} from "../../../shop/checkout/payment/payment-method";
import {OrderedItem} from "../../model/ordered-item";
import {processInParallelAndWait} from "../../../util/observable-util";
import {OrderStatus} from "../../model/order-status";
import {CapacityService} from "./capacity.service";
import {StockService} from "./stock.service";
import {DiscountService} from "../../../shop/shared/services/discount.service";
import {Filter} from "../../model/api/filter";
import {PageRequest} from "../../model/api/page-request";
import {Sort} from "../../model/api/sort";
import {Page, PageResponse} from "../../model/api/page";

interface ParticipantApiResponse {
	orderedItems: Participant[]
}

@Injectable()
export class OrderedItemService extends ServletService<OrderedItem> {
	constructor(protected http: HttpClient,
				private capacityService: CapacityService,
				private discountService: DiscountService,
				private stockService: StockService,
				private orderService: OrderService,
				private userService: UserService) {
		super(http, "/api/orderedItem");

	}

	add(orderedItem: OrderedItem): Observable<OrderedItem> {
		const modifiedItem: OrderedItem = {...orderedItem};
		if (modifiedItem.item && EventUtilityService.isEvent(modifiedItem.item)) {
			modifiedItem.item = <any>modifiedItem.item.id;
		}

		return this.http.post<AddOrModifyResponse>(this.baseUrl, {orderedItem: modifiedItem}, {
			headers: new HttpHeaders().set("Content-Type", "application/json")
		})
			.pipe(
				tap((response) => {
					this.invalidateValue(response.id);
				}),
				mergeMap(response => this.getById(response.id)),
				tap(it => this.updateCapacities(it))
			)
	}


	addParticipant(participant: ParticipantUser, eventType: EventType, eventId: number): Observable<Participant> {
		let {user, ...newParticipant} = participant;

		return this.discountService.getDiscountedPriceOfEvent(newParticipant.item.id, user.id)
			.pipe(
				mergeMap(discountedPrice => {
					if (newParticipant["item"] && newParticipant["item"]["id"] !== undefined) {
						(<any>newParticipant).item = participant.item.id;
					}
					newParticipant.price = discountedPrice;
					//todo add name/phone number to text or order


					return this.add(newParticipant)
						.pipe(
							mergeMap(item => {
								let order = Order.create().setProperties({
									timeStamp: new Date(),
									items: [item.id],
									user: user.id,
									method: PaymentMethod.CASH,
									text: "",
								});
								return this.orderService.add(order).pipe(
									map(order => item)
								)
							})
						)
				})
			)
	}

	modify(orderedItem: OrderedItem): Observable<OrderedItem> {
		const modifiedItem = {...orderedItem};
		if (modifiedItem.item && EventUtilityService.isEvent(modifiedItem.item)) {
			modifiedItem.item = <any>modifiedItem.item.id;
		}

		return this.http.put<AddOrModifyResponse>(this.baseUrl, {orderedItem: modifiedItem}, {
			headers: new HttpHeaders().set("Content-Type", "application/json")
		})
			.pipe(
				tap((response) => {
					this.invalidateValue(response.id);
				}),
				mergeMap(response => this.getById(response.id)),
				tap(it => this.updateCapacities(it))
			)
	}

	modifyParticipant(participant: ParticipantUser): Observable<Participant> {
		let {user, ...modifiedParticipant} = participant;

		if (modifiedParticipant["item"] && modifiedParticipant["item"]["id"] !== undefined) {
			(<any>modifiedParticipant).item = participant.item.id;
		}

		//todo add name/phone number to text or order
		return this.modify(modifiedParticipant);
	}

	remove(id: number): Observable<Object> {
		return this.getById(id).pipe(
			mergeMap(orderedItem => {
				return this.performRequest(
					this.http.delete(this.baseUrl, {
						params: new HttpParams().set("id", "" + id)
					})
				)
					.pipe(
						//convert the observable to a hot observable, i.e. immediately perform the http request
						//instead of waiting for someone to subscribe
						share(),
						tap(() => {
							this.updateCapacities(orderedItem);
							this.invalidateValue(id, true);
						})
					);
			})
		)

	}


	/**
	 *
	 * @param {Order} order
	 * @returns {Observable<Order>}
	 */
	cancelOrder(order: Order): Observable<Order> {
		return this.changeStatusOfOrder(order, OrderStatus.CANCELLED);
	}

	/**
	 *
	 * @param {Order} order
	 * @param {OrderStatus} newStatus
	 * @returns {Observable<Order>}
	 */
	changeStatusOfOrder(order: Order, newStatus: OrderStatus): Observable<Order> {
		const items = [...order.items];

		return processInParallelAndWait(
			items
				.map(item => {
					item.status = newStatus;
					return item;
				})
				.map(item => this.modify(item))
		)
			.pipe(
				tap(() => this.orderService.invalidateValue(order.id)),
				mergeMap(items => this.orderService.getById(order.id)),
				tap(newOrder => this.orderService.updateCapacities(newOrder))
			)
	}


	/**
	 *
	 * @param eventId
	 * @param eventType
	 * @param pageRequest
	 * @param sort
	 * @returns {any}
	 */
	getParticipantIdsByEvent(eventId: number, pageRequest: PageRequest, sort: Sort): Observable<Page<Participant>> {
		return this.get(
			Filter.by({"eventId": "" + eventId}),
			pageRequest,
			sort
		);
	}

	/**
	 *
	 * @param eventId
	 * @param pageRequest
	 * @param sort
	 * @param sort
	 */
	getParticipantUsersByEvent(eventId: number, pageRequest: PageRequest, sort: Sort): Observable<Page<ParticipantUser>> {
		return this.getParticipantIdsByEvent(eventId, pageRequest, sort)
			.pipe(
				mergeMap(participants => {
					return of(PageResponse.empty());
					// if (!participants || participants.empty) {
					// 	return of(PageResponse.empty());
					// }
					//
					// //todo
					//
					// return combineLatest(
					// 	...participants.map(participant => this.userService.getByParticipantId(participant.id)
					// 		.pipe(
					// 			map(user => ({
					// 				...participant,
					// 				user,
					// 			}))
					// 		)))
				})
			)
	}


	/**
	 *
	 * @param userId
	 */
	getParticipatedEventsOfUser(userId: number): Observable<(Tour | Party)[]> {
		const params = new HttpParams().set("userId", "" + userId);
		const request = this.performRequest(
			this.http.get<{ shopItems: (Party | Merchandise | Tour)[] }>("/api/participatedEvents", {params})
		).pipe(
			map(json => json.shopItems
				.filter(event => !EventUtilityService.isMerchandise(event))
				.map(event => EventUtilityService.handleShopItemOptional(event,
					{
						tours: it => Tour.create().setProperties({...it}),
						partys: it => Party.create().setProperties({...it})
					})
				)),
			share()
		);

		return this._cache.other<(Tour | Party)[]>(params, request);
	}

	/**
	 *
	 * @param {OrderedItem} orderedItem
	 */
	updateCapacities(orderedItem: OrderedItem) {
		const item = orderedItem.item;

		if (item.type === typeToInteger(EventType.merch)) {
			this.stockService.invalidateValue(item.id);
		}
		else {
			this.capacityService.invalidateValue(item.id);
		}
	}

	invalidateCache() {
		this._cache.invalidateAll();
	}

	addOrModify(requestMethod: AddOrModifyRequest, entry: OrderedItem, options?: any): Observable<OrderedItem> {
		return undefined;
	}
}
