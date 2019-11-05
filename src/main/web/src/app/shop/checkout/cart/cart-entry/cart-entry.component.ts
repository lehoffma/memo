import {Component, Input, OnDestroy, OnInit} from "@angular/core";
import {ShoppingCartService} from "../../../../shared/services/shopping-cart.service";
import {EventUtilityService} from "../../../../shared/services/event-utility.service";
import {Event, maximumItemAmount} from "../../../shared/model/event";
import {StockService} from "../../../../shared/services/api/stock.service";
import {BehaviorSubject, combineLatest, Observable, of, Subscription} from "rxjs";
import {catchError, filter, map, mergeMap, tap} from "rxjs/operators";
import {ShoppingCartItem, ShoppingCartOption} from "../../../../shared/model/shopping-cart-item";
import {Discount, getDiscountAmount} from "../../../../shared/renderers/price-renderer/discount";
import {DiscountService} from "../../../shared/services/discount.service";
import {LogInService} from "../../../../shared/services/api/login.service";
import {CapacityService} from "../../../../shared/services/api/capacity.service";
import {OrderedItemService} from "../../../../shared/services/api/ordered-item.service";


@Component({
	selector: "memo-cart-entry",
	templateUrl: "./cart-entry.component.html",
	styleUrls: ["./cart-entry.component.scss"]
})
export class CartEntryComponent implements OnInit, OnDestroy {

	_cartItem$: BehaviorSubject<ShoppingCartItem> = new BehaviorSubject(null);
	amountOptions = [];
	subscription: Subscription;


	//calculate discounts according to limit
	//	check how many orderedItems there already are for the current user (N)
	//	apply discount limit - N times
	discountError: any;
	discounts$: Observable<Discount[]> = combineLatest([
		this._cartItem$,
		this.loginService.currentUser$
	])
		.pipe(
			mergeMap(([cartItem, user]) => this.orderedItemService.getDiscountsForCartItem(cartItem, user)),
			catchError(error => {
				console.error(error);
				this.discountError = error;
				return of([]);
			})
		);

	discountValue$: Observable<number> = combineLatest([
		this._cartItem$,
		this.discounts$
	]).pipe(
		map(([cartItem, discounts]) => getDiscountAmount(cartItem.item.price * cartItem.amount, discounts))
	);

	constructor(private shoppingCartService: ShoppingCartService,
				private discountService: DiscountService,
				private capacityService: CapacityService,
				private orderedItemService: OrderedItemService,
				private loginService: LogInService,
				private stockService: StockService) {
	}

	get cartItem() {
		return this._cartItem$.getValue();
	}

	@Input() set cartItem(cartItem: ShoppingCartItem) {
		this._cartItem$.next(cartItem);
	}

	get linkToItem() {
		let category = EventUtilityService.getEventType(this.cartItem.item);
		return `/shop/${category}/${this.cartItem.item.id}`
	}

	ngOnInit() {
		let maxAmount$: Observable<number> = this.getMaxAmount(this.cartItem);

		this.discountValue$ = this.discounts$
			.pipe(
				map(discounts => discounts.reduce((acc, discount) =>
					acc + discount.amount, 0))
			);

		this.subscription = maxAmount$.subscribe(maxAmount => {
			this.amountOptions = Array.from(Array(maxAmount + 1).keys());
		})
	}

	/**
	 *
	 * @returns {Observable<number>}
	 */
	getMaxAmount(cartItem: ShoppingCartItem): Observable<number> {
		//if the cart item is a merchandise object,
		//we have to extract the number from the item's stock (by calling the stockservice function)
		if (EventUtilityService.isMerchandise(cartItem.item)) {
			return this.stockService.getByEventId(cartItem.item.id)
				.pipe(
					map(stock => stock
					// we have to consider the selected color and size attributes
					//we can just look at the first value since the color and size values should not change
					//across the options array, only stuff like isDriver and needsTicket might be different
						.filter(stockItem =>
							stockItem.color.hex === cartItem.options[0].color.hex
							&& stockItem.size === cartItem.options[0].size
						)
						.reduce((acc, stockItem) => acc + stockItem.amount, 0)),
					map(amount => maximumItemAmount(cartItem.item, amount))
				);
		} else {
			return this.capacityService.valueChanges(cartItem.item.id)
				.pipe(
					filter(it => it !== null),
					map(it => it.capacity),
					map(amount => maximumItemAmount(cartItem.item, amount))
				);
		}
	}


	ngOnDestroy(): void {
		this.subscription.unsubscribe();
	}

	/**
	 * Delegates the call to the isMerchandise function of the util service (so we can use it in the template)
	 * @param event
	 * @returns {boolean}
	 */
	itemIsMerch(event: Event) {
		return EventUtilityService.isMerchandise(event);
	}

	/**
	 *
	 * @param {Event} event
	 * @returns {event is Tour}
	 */
	itemIsTour(event: Event) {
		return EventUtilityService.isTour(event);
	}

	/**
	 * Callback of the remove icon
	 * Removes the item from the shopping cart service completely
	 */
	deleteItem() {
		const eventType = EventUtilityService.getEventType(this.cartItem.item);
		this.shoppingCartService.deleteItem(eventType, this.cartItem.item.id, this.cartItem.options);
	}

	/**
	 * Callback of the remove icon of the participants list
	 * @param {number} index
	 */
	deleteOption(index: number) {
		const eventType = EventUtilityService.getEventType(this.cartItem.item);
		const options = [...this.cartItem.options];
		options.splice(index, 1);
		this.shoppingCartService.pushItem(eventType, {
			id: this.cartItem.item.id,
			item: this.cartItem.item,
			amount: this.cartItem.amount - 1,
			options
		});
	}

	/**
	 *
	 * @param {ShoppingCartItem} cartItem
	 * @returns {ShoppingCartOption}
	 */
	updateOptions(cartItem: ShoppingCartItem): ShoppingCartOption[] {
		const options = [...cartItem.options];

		//todo parties now have options too

		let diff = cartItem.amount - options.length;

		//we have to delete options
		if (diff < 0) {
			while (diff++ < 0) {
				options.splice(options.length - 1, 1);
			}
		}

		//we have to add dummy options
		else {
			const dummyOption: ShoppingCartOption = (this.itemIsTour(cartItem.item))
				? {isDriver: false, needsTicket: true, name: "Teilnehmer"}
				: (this.itemIsMerch(cartItem.item)
					? {color: options[options.length - 1].color, size: options[options.length - 1].size}
					: {name: "Teilnehmer"});

			while (diff-- > 0) {
				options.push({...dummyOption})
			}
		}
		return options;
	}

	/**
	 * Callback of the amount dropdown
	 * Pushes a new amount value to the cart service
	 */
	updateEventAmount() {
		const eventType = EventUtilityService.getEventType(this.cartItem.item);

		const options = this.updateOptions(this.cartItem);

		this.shoppingCartService.pushItem(eventType, {
			id: this.cartItem.item.id,
			item: this.cartItem.item,
			amount: this.cartItem.amount,
			options: [...options]
		});
	}
}

