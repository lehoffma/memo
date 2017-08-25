import {Component, Input, OnChanges, OnInit} from "@angular/core";
import {Event} from "../../../../shared/model/event";
import {Merchandise} from "../../../../shared/model/merchandise";
import {ShoppingCartService} from "../../../../../shared/services/shopping-cart.service";
import {EventUtilityService} from "../../../../../shared/services/event-utility.service";
import {EventOverviewKey} from "./event-overview-key";
import {StockService} from "../../../../../shared/services/stock.service";
import {Observable} from "rxjs/Observable";
import * as moment from "moment";
import {MerchColor} from "../../../../shared/model/merch-color";
import {MerchStockList} from "../../../../shared/model/merch-stock";
import {BehaviorSubject} from "rxjs/BehaviorSubject";


@Component({
	selector: "memo-item-details-overview",
	templateUrl: "./item-details-overview.component.html",
	styleUrls: ["./item-details-overview.component.scss"]
})
export class ItemDetailsOverviewComponent implements OnInit, OnChanges {
	_event$: BehaviorSubject<Event> = new BehaviorSubject(Event.create());
	public colorSelection$: Observable<MerchColor[]> =
		Observable.combineLatest(
			this._event$
				.filter(event => EventUtilityService.isMerchandise(event)),
		)
			.flatMap(([merch]) => this.getColorSelection(<Merchandise>merch, ""));
	@Input() overviewKeys: EventOverviewKey[] = [];
	_color$: BehaviorSubject<MerchColor> = new BehaviorSubject(undefined);
	public sizeSelection$: Observable<string[]> =
		Observable.combineLatest(
			this._event$
				.filter(event => EventUtilityService.isMerchandise(event)),
			this._color$
		)
			.flatMap(([merch, color]) => this.getSizeSelection(<Merchandise>merch, color));
	_size$: BehaviorSubject<string> = new BehaviorSubject(undefined);
	model = {
		amount: undefined
	};
	public amountOptions: number[] = [];
	public maxAmount: number = 0;
	public isPartOfShoppingCart: boolean;
	public isPastEvent: boolean = false;

	constructor(private eventUtilityService: EventUtilityService,
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
		if (this.event) {
			this.updateMaxAmount();
			if (this.event.date) {
				//todo as observable
				this.isPastEvent = moment(this.event.date).isBefore(moment());
			}
		}
	}

	ngOnInit() {
		if (this.event) {
			this.updateMaxAmount();
		}
	}

	/**
	 *
	 * @param {Merchandise} merch
	 * @param {string} size
	 * @returns {Observable<MerchColor[]>}
	 */
	getColorSelection(merch: Merchandise, size: string): Observable<MerchColor[]> {
		return this.stockService.getByEventId(merch.id)
			.map((stock: MerchStockList) => {
				return stock
				//remove values that aren't possible with the current size selection
					.filter(stockItem => !size ? true : stockItem.size === size)
					.map(stockItem => stockItem.color)
					//remove duplicates
					.filter((stockColor, index, array) => array
						.findIndex(color => stockColor.name === color.name) === index);
			})
	}


	/**
	 *
	 * @param {Merchandise} merch
	 * @param {string} color
	 * @returns {Observable<MerchColor[]>}
	 */
	getSizeSelection(merch: Merchandise, color: MerchColor): Observable<string[]> {
		return this.stockService.getByEventId(merch.id)
			.map((stock: MerchStockList) => {
				return stock
				//remove values that aren't possible with the current color selection
					.filter(stockItem => !color ? true : stockItem.color.name === color.name)
					.map(stockItem => stockItem.size)
					//remove duplicates
					.filter((stockSize, index, array) => array
						.findIndex(size => size === stockSize) === index);
			})
	}

	/**
	 * Updates maxAmount and amountOptions (i.e. the amount-dropdown)
	 */
	updateMaxAmount() {
		let maxAmount$ = this.isMerch(this.event)
			? this.stockService.getByEventId(this.event.id)
				.map(stock => stock
				// we have to consider the selected color and size attributes
					.filter(stockItem =>
						this.color &&
						stockItem.color.hex === this.color.hex
						&& stockItem.size === this.size
					)
					.reduce((acc, stockItem) => acc + stockItem.amount, 0))
			: Observable.of(this.event.capacity);

		maxAmount$.subscribe(maxAmount => {
			this.maxAmount = maxAmount;

			//fills the amountOptions variable with integers from 0 to maxAmount
			this.amountOptions = Array((this.maxAmount === undefined) ? 0 : this.maxAmount + 1).fill(0).map((_, i) => i);

			let shoppingCartItem = this.shoppingCartService.getItem(EventUtilityService.getEventType(this.event),
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
