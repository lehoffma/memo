import {Injectable} from "@angular/core";
import {EventType, typeToInteger} from "../../../shop/shared/model/event-type";
import {Participant, ParticipantUser} from "../../../shop/shared/model/participant";
import {UserService} from "./user.service";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {AddOrModifyRequest, AddOrModifyResponse, ServletService} from "./servlet.service";
import {EventUtilityService} from "../event-utility.service";
import {Observable, of} from "rxjs";
import {map, mergeMap, share, switchMap, tap} from "rxjs/operators";
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
import {ParticipantState} from "../../model/participant-state";
import {Discount, getDiscountAmount, getDiscountedPrice} from "../../renderers/price-renderer/discount";
import {flatMap, flatten} from "../../../util/util";
import {ShoppingCartItem} from "../../model/shopping-cart-item";
import {User} from "../../model/user";

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

	add(orderedItem: OrderedItem, userId: number): Observable<OrderedItem> {
		const modifiedItem: OrderedItem = {...orderedItem};
		if (modifiedItem.item && EventUtilityService.isEvent(modifiedItem.item)) {
			modifiedItem.item = <any>modifiedItem.item.id;
		}

		return this.http.post<AddOrModifyResponse>(this.baseUrl, {orderedItem: modifiedItem, user: userId}, {
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


	addParticipant(participant: ParticipantUser): Observable<Participant> {
		let {user, ...newParticipant} = participant;

		return this.discountService.getDiscountedPriceOfEvent(newParticipant.item.id, user.id)
			.pipe(
				mergeMap(discountedPrice => {
					if (newParticipant["item"] && newParticipant["item"]["id"] !== undefined) {
						(<any>newParticipant).item = participant.item.id;
					}
					newParticipant.price = discountedPrice;
					//todo add name/phone number to text or order

					return this.add(newParticipant, user.id)
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

	modify(orderedItem: OrderedItem, userId: number): Observable<OrderedItem> {
		const modifiedItem: OrderedItem = {...orderedItem};
		if (modifiedItem.item && EventUtilityService.isEvent(modifiedItem.item)) {
			modifiedItem.item = <any>modifiedItem.item.id;
		}

		//reset last cancel timestamp if order status has changed to non-cancelled
		if(modifiedItem.status !== OrderStatus.CANCELLED){
			modifiedItem.lastCancelTimestamp = null;
		}

		return this.http.put<AddOrModifyResponse>(this.baseUrl, {orderedItem: modifiedItem, user: userId}, {
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
		return this.modify(modifiedParticipant, user.id);
	}

	remove(id: number): Observable<Object> {
		return this.getById(id).pipe(
			mergeMap(orderedItem => {
				return super.remove(id)
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

	invalidateState(itemId: string) {
		this._cache.invalidateByPartialParams(new HttpParams().set("id", itemId))
	}

	getStateOfItem(itemId: string, showCancelled = false): Observable<ParticipantState> {
		const url = "/api/orderedItem/state";
		const params = new HttpParams()
			.set("id", itemId)
			.set("showCancelled", "" + showCancelled);

		return this.getForCustomUrl(url, params);
	}

	getOrderedItemsForLoggedInUser(shopItemId: number | string): Observable<OrderedItem[]> {
		const url = "/api/orderedItem/byUserAndItem";
		const params = new HttpParams()
			.set("itemId", shopItemId + "");

		return this.getForCustomUrl(url, params);
	}

	getAmountOfOrdersForLoggedInUser(shopItemId: number): Observable<number> {
		const url = "/api/orderedItem/byUserAndItem/count";
		const params = new HttpParams()
			.set("itemId", shopItemId + "");
		return this.getForCustomUrl(url, params);
	}


	public getDiscountsForCartItem(cartItem: ShoppingCartItem, user: User): Observable<Discount[]> {
		return this.discountService.getEventDiscounts(
			cartItem.id, user === null ? undefined : user.id
		).pipe(
			switchMap(discounts => {
				if (!discounts.some(discount => discount.limitPerUserAndItem > 0)) {
					//apply all discounts on all items if there is no limit at all
					return of(flatten(new Array(cartItem.amount).fill(discounts)));
				}

				return this.getAmountOfOrdersForLoggedInUser(cartItem.item.id)
					.pipe(
						map(amountOfOrders => {
							//apply discount (limit - amountOfOrders) times

							return flatMap(discount => {
								const howOften = discount.limitPerUserAndItem - amountOfOrders;
								if (howOften <= 0) {
									return [];
								}
								return new Array(Math.min(cartItem.amount, howOften)).fill(discount);
							}, discounts);
						}),
						share()
					)
			})
		) as Observable<Discount[]>
	}

	public getDiscountedPriceForCartItem(cartItem: ShoppingCartItem, user: User): Observable<number> {
		return this.getDiscountsForCartItem(cartItem, user).pipe(
			map(discounts => getDiscountedPrice(cartItem.item.price  * cartItem.amount, discounts))
		)
	}

	public getDiscountValueForCartItem(cartItem: ShoppingCartItem, user: User): Observable<number> {
		return this.getDiscountsForCartItem(cartItem, user).pipe(
			map(discounts => getDiscountAmount(cartItem.item.price * cartItem.amount, discounts))
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

	cancelOrderItem(order: Order, item: OrderedItem) {
		return this.changeStatusOfOrderItem(order, item, OrderStatus.CANCELLED);
	}

	/**
	 *
	 * @param {Order} order
	 * @param item
	 * @param status
	 * @returns {Observable<Order>}
	 */
	changeStatusOfOrderItem(order: Order, item: OrderedItem, status: OrderStatus): Observable<Order> {
		if(status === OrderStatus.CANCELLED){
			item.lastCancelTimestamp = new Date();
		}

		return this.modify({
			...item,
			status
		}, order.user)
			.pipe(
				tap(() => this.orderService.invalidateValue(order.id)),
				mergeMap(items => this.orderService.getById(order.id)),
				tap(newOrder => this.orderService.updateCapacities(newOrder))
			)
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
					if(newStatus === OrderStatus.CANCELLED){
						item.lastCancelTimestamp = new Date();
					}
					return item;
				})
				.map(item => this.modify(item, order.user))
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
	 * @param additionalFilter
	 */
	getParticipatedEventsOfUser(userId: number, pageRequest: PageRequest, sort: Sort, additionalFilter?: Filter): Observable<Page<Event>> {
		return this.eventService.get(
			Filter.combine(
				Filter.by({
					"userId": "" + userId,
					"type": typeToInteger(EventType.tours) + "," + typeToInteger(EventType.partys)
				}),
				additionalFilter || Filter.none()
			),
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
		} else {
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
