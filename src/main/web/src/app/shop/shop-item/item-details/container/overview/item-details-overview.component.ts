import {Component, Input, OnChanges, OnInit} from "@angular/core";
import {Event} from "../../../../shared/model/event";
import {Merchandise} from "../../../../shared/model/merchandise";
import {ShoppingCartService} from "../../../../../shared/services/shopping-cart.service";
import {EventUtilityService} from "../../../../../shared/services/event-utility.service";
import {EventOverviewKey} from "./event-overview-key";
import {StockService} from "../../../../../shared/services/api/stock.service";
import * as moment from "moment";
import {MerchColor} from "../../../../shared/model/merch-color";
import {MerchStockList} from "../../../../shared/model/merch-stock";
import {ShopItem} from "../../../../../shared/model/shop-item";
import {TypeOfProperty} from "../../../../../shared/model/util/type-of-property";
import {ParticipantsService} from "../../../../../shared/services/api/participants.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";
import {filter, first, map, mergeMap} from "rxjs/operators";
import {combineLatest} from "rxjs/observable/combineLatest";
import {of} from "rxjs/observable/of";


@Component({
	selector: "memo-item-details-overview",
	templateUrl: "./item-details-overview.component.html",
	styleUrls: ["./item-details-overview.component.scss"]
})
export class ItemDetailsOverviewComponent implements OnInit, OnChanges {
	_event$: BehaviorSubject<Event> = new BehaviorSubject(Event.create());


	stock$: Observable<MerchStockList> = this._event$
		.pipe(
			filter(event => EventUtilityService.isMerchandise(event)),
			filter(event => event.id !== -1),
			mergeMap(event => this.stockService.getByEventId(event.id))
		);


	public colorSelection$: Observable<MerchColor[]> = this.getColorSelection("");

	@Input() overviewKeys: EventOverviewKey[] = [];
	_color$: BehaviorSubject<MerchColor> = new BehaviorSubject(undefined);
	public sizeSelection$: Observable<string[]> = this._color$
		.pipe(
			mergeMap(color => this.getSizeSelection(color))
		);
	_size$: BehaviorSubject<string> = new BehaviorSubject(undefined);
	model = {
		amount: undefined
	};
	public amountOptions: number[] = [];
	public maxAmount: number = 0;
	public isPartOfShoppingCart: boolean;
	public isPastEvent: boolean = false;
	values: {
		[key in keyof ShopItem]?: Observable<TypeOfProperty<ShopItem>>
		} = {};

	constructor(private participantService: ParticipantsService,
				private stockService: StockService,
				private shoppingCartService: ShoppingCartService) {
	}

	get event() {
		return this._event$.getValue();
	}

	@Input()
	set event(event: Event) {
		this._event$.next(event);
	}

	get color() {
		return this._color$.getValue();
	}

	set color(color: MerchColor) {
		this._color$.next(color);
	}

	get size() {
		return this._size$.getValue();
	}

	set size(size: string) {
		this._size$.next(size);
	}

	ngOnChanges() {
		if (this.event && this.event.id !== -1) {
			this.updateMaxAmount();
			if (this.event.date) {
				//todo as observable
				this.isPastEvent = moment(this.event.date).isBefore(moment());
			}
		}
	}

	ngOnInit() {
		if (this.event && this.event.id !== -1) {
			this.updateMaxAmount();
		}
	}

	/**
	 *
	 * @param {string} key
	 * @returns {Observable<TypeOfProperty<ShopItem>>}
	 */
	getValue(key: string): Observable<TypeOfProperty<ShopItem>> {
		if (!this.values[key]) {
			//cache observable so we only have to query the value once
			if (this.isMerch(this.event) && key === "capacity") {
				this.values[key] = this.stock$
					.pipe(
						map(stock => stock.reduce((sum, it) => sum + it.amount, 0))
					);
			}
			else if (key === "emptySeats") {
				this.values[key] = this._event$
					.pipe(
						mergeMap(event =>
							this.participantService
								.getParticipantIdsByEvent(event.id, EventUtilityService.getEventType(event))
								.pipe(
									map(participants => event.capacity - participants.length))
						)
					);
			}
			else {
				this.values[key] = this._event$
					.pipe(
						map(event => event[key])
					);
			}
		}
		return this.values[key];
	}

	/**
	 *
	 * @param {Merchandise} merch
	 * @param {string} size
	 * @returns {Observable<MerchColor[]>}
	 */
	getColorSelection(size: string): Observable<MerchColor[]> {
		return this.stock$
			.pipe(
				map((stock: MerchStockList) => {
					return stock
					//remove values that aren't possible with the current size selection
						.filter(stockItem => !size ? true : stockItem.size === size)
						.map(stockItem => stockItem.color)
						//remove duplicates
						.filter((stockColor, index, array) => array
							.findIndex(color => stockColor.name === color.name) === index);
				})
			);
	}


	/**
	 *
	 * @param {string} color
	 * @returns {Observable<MerchColor[]>}
	 */
	getSizeSelection(color: MerchColor): Observable<string[]> {
		return this.stock$
			.pipe(
				map((stock: MerchStockList) => {
					return stock
					//remove values that aren't possible with the current color selection
						.filter(stockItem => !color ? true : stockItem.color.name === color.name)
						.map(stockItem => stockItem.size)
						//remove duplicates
						.filter((stockSize, index, array) => array
							.findIndex(size => size === stockSize) === index);
				})
			);
	}

	/**
	 * Updates maxAmount and amountOptions (i.e. the amount-dropdown)
	 */
	updateMaxAmount() {
		const maxAmount$ = this.isMerch(this.event)
			? combineLatest(this.stock$, this._color$, this._size$)
				.pipe(
					map(([stock, color, size]) => stock
					// we have to consider the selected color and size attributes
						.filter(stockItem =>
							color &&
							stockItem.color.hex === color.hex
							&& stockItem.size === size
						)
						.reduce((acc, stockItem) => acc + stockItem.amount, 0))
				)
			: of(this.event.capacity);

		maxAmount$
			.pipe(first())
			.subscribe(maxAmount => {
				this.maxAmount = maxAmount;

				//fills the amountOptions variable with integers from 0 to maxAmount
				this.amountOptions = Array((this.maxAmount === undefined) ? 0 : this.maxAmount + 1).fill(0).map((_, i) => i);

				const shoppingCartItem = this.shoppingCartService.getItem(EventUtilityService.getEventType(this.event),
					this.event.id, {color: this.color, size: this.size});

				if (shoppingCartItem) {
					this.model.amount = shoppingCartItem.amount;
				}
				else {
					this.model.amount = 0;
				}
				this.isPartOfShoppingCart = this.model.amount > 0;
			});

	}

	isMerch(event): event is Merchandise {
		return EventUtilityService.isMerchandise(event);
	}

	/**
	 *
	 */
	updateShoppingCart() {
		const shoppingCartItem = this.shoppingCartService.getItem(EventUtilityService.getEventType(this.event),
			this.event.id, {color: this.color, size: this.size});
		const eventType = EventUtilityService.getEventType(this.event);
		const newItem = {
			id: this.event.id,
			amount: this.model.amount,
			options: {color: this.color, size: this.size}
		};

		if (shoppingCartItem) {
			this.shoppingCartService.pushItem(eventType, newItem)
		}

		if (this.model.amount === 0) {
			this.shoppingCartService.deleteItem(eventType, newItem.id, newItem.options);
			this.isPartOfShoppingCart = false;
		}
	}

	/**
	 * Fügt das aktuelle Item dem Warenkorb hinzu.
	 */
	addOrDeleteFromCart(item: Event) {
		let shoppingCartItem = this.shoppingCartService.getItem(EventUtilityService.getEventType(this.event),
			this.event.id, {color: this.color, size: this.size});

		if (shoppingCartItem) {
			//delete
			this.shoppingCartService.deleteItem(EventUtilityService.getEventType(this.event), this.event.id, {
				color: this.color,
				size: this.size
			});
			this.isPartOfShoppingCart = false;
		}
		else {
			//add
			this.shoppingCartService.pushItem(EventUtilityService.getEventType(item), {
				id: item.id,
				options: {color: this.color, size: this.size},
				amount: this.model.amount
			});
			this.isPartOfShoppingCart = true;
		}
	}

}
