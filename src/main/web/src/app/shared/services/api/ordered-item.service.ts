import {Injectable} from "@angular/core";
import {EventType, typeToInteger} from "../../../shop/shared/model/event-type";
import {Participant, ParticipantUser} from "../../../shop/shared/model/participant";
import {UserService} from "./user.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {AddOrModifyRequest, AddOrModifyResponse, ServletService} from "./servlet.service";
import {EventUtilityService} from "../event-utility.service";
import {Observable, of} from "rxjs";
import {map, mergeMap, share, tap} from "rxjs/operators";
import {OrderService} from "./order.service";
import {createOrder, Order} from "../../model/order";
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
import {EventService} from "./event.service";
import {setProperties} from "../../model/util/base-object";
import {Event} from "../../../shop/shared/model/event";

interface ParticipantApiResponse {
	orderedItems: Participant[]
}

@Injectable()
export class OrderedItemService extends ServletService<OrderedItem> {
	constructor(protected http: HttpClient,
				private capacityService: CapacityService,
				private discountService: DiscountService,
				private eventService: EventService,
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
								let order = setProperties(createOrder(), {
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
		const modifiedItem: OrderedItem = {...orderedItem};
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
	getParticipantIdsByEvent(eventId: number, sort: Sort): Observable<Participant[]> {
		return this.getAll(
			Filter.by({"eventId": "" + eventId}),
			sort
		);
	}

	public getParticipantUsers(filter: Filter, pageRequest: PageRequest, sort: Sort): Observable<Page<ParticipantUser>> {
		return this.get(filter, pageRequest, sort)
			.pipe(
				mergeMap((participants: Page<OrderedItem>) => {
					if (!participants || participants.empty) {
						return of(PageResponse.empty());
					}

					return PageResponse.mapToObservable(participants,
						value => this.userService.getByParticipantId(value.id).pipe(
							map(user => ({
								...value,
								user
							}))
						)
					)
				}),
			)
	}

	/**
	 *
	 * @param eventId
	 * @param pageRequest
	 * @param sort
	 * @param sort
	 */
	getParticipantUsersByEvent(eventId: number, pageRequest: PageRequest, sort: Sort): Observable<Page<ParticipantUser>> {
		return this.getParticipantUsers(Filter.by({"eventId": "" + eventId}), pageRequest, sort);
	}


	/**
	 *
	 * @param userId
	 * @param pageRequest
	 * @param sort
	 */
	getParticipatedEventsOfUser(userId: number, pageRequest: PageRequest, sort: Sort): Observable<Page<Event>> {
		return this.eventService.get(
			Filter.by({
				"userId": "" + userId,
				"type": typeToInteger(EventType.tours) + "|" + typeToInteger(EventType.partys)
			}),
			pageRequest,
			sort
		);
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
		this.discountService.invalidateEventDiscounts(item.id);

	}

	invalidateCache() {
		this._cache.invalidateAll();
	}

	addOrModify(requestMethod: AddOrModifyRequest, entry: OrderedItem, options?: any): Observable<OrderedItem> {
		return undefined;
	}
}
