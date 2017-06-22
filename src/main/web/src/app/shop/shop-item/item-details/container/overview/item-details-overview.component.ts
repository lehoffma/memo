import {Component, Input, OnChanges, OnInit} from "@angular/core";
import {Event} from "../../../../shared/model/event";
import {Merchandise} from "../../../../shared/model/merchandise";
import {ShoppingCartService} from "../../../../../shared/services/shopping-cart.service";
import {EventUtilityService} from "../../../../../shared/services/event-utility.service";
import {EventOverviewKey} from "./event-overview-key";
import {StockService} from "../../../../../shared/services/stock.service";
import {Observable} from "rxjs/Observable";


@Component({
	selector: "memo-item-details-overview",
	templateUrl: "./item-details-overview.component.html",
	styleUrls: ["./item-details-overview.component.scss"]
})
export class ItemDetailsOverviewComponent implements OnInit, OnChanges {
	@Input() event: Event = Event.create();
	@Input() overviewKeys: EventOverviewKey[] = [];
	model = {
		options: {
			color: undefined,
			size: undefined
		},
		amount: undefined
	};

	public colorSelection = [];
	public sizeSelection = [];
	public amountOptions: number[] = [];
	public maxAmount: number = 0;
	public isPartOfShoppingCart: boolean;

	constructor(private eventUtilityService: EventUtilityService,
				private stockService: StockService,
				private shoppingCartService: ShoppingCartService) {
	}

	ngOnChanges() {
		if (this.event) {
			this.updateMaxAmount();
			if (this.isMerch(this.event)) {
				//todo mache farben/größen abhängig vom stock/voneinander
				this.colorSelection = (<Merchandise>this.event).colors;
				this.sizeSelection = (<Merchandise>this.event).clothesSizeSelections;
			}
		}
	}

	ngOnInit() {
		if (this.isMerch(this.event) && this.colorSelection.length > 0 && this.sizeSelection.length > 0) {
			this.model.options.color = this.colorSelection[0];
			this.model.options.size = this.sizeSelection[0].value;
		}
		if (this.event) {
			this.updateMaxAmount();
		}
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
						this.model.options.color &&
						stockItem.color.hex === this.model.options.color.hex
						&& stockItem.size === this.model.options.size
					)
					.reduce((acc, stockItem) => acc + stockItem.amount, 0))
			: Observable.of(this.event.capacity);

		maxAmount$.subscribe(maxAmount => {
			this.maxAmount = maxAmount;

			//fills the amountOptions variable with integers from 0 to maxAmount
			this.amountOptions = Array((this.maxAmount === undefined) ? 0 : this.maxAmount + 1).fill(0).map((_, i) => i);

			let shoppingCartItem = this.shoppingCartService.getItem(EventUtilityService.getEventType(this.event),
				this.event.id, Object.assign({}, this.model.options));

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
			this.event.id, Object.assign({}, this.model.options));
		const eventType = EventUtilityService.getEventType(this.event);
		const newItem = {
			id: this.event.id,
			amount: this.model.amount,
			options: this.model.options
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
			this.event.id, Object.assign({}, this.model.options));

		if (shoppingCartItem) {
			//delete
			this.shoppingCartService.deleteItem(EventUtilityService.getEventType(this.event), this.event.id, this.model.options);
			this.isPartOfShoppingCart = false;
		}
		else {
			//add
			this.shoppingCartService.pushItem(EventUtilityService.getEventType(item), {
				id: item.id,
				options: Object.assign({}, this.model.options),
				amount: this.model.amount
			});
			this.isPartOfShoppingCart = true;
		}
	}

}
