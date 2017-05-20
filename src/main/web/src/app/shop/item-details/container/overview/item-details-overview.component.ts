import {Component, Input, OnChanges, OnInit} from "@angular/core";
import {Event} from "../../../shared/model/event";
import {Merchandise} from "../../../shared/model/merchandise";
import {ShoppingCartService} from "../../../../shared/services/shopping-cart.service";
import {EventUtilityService} from "../../../../shared/services/event-utility.service";
import {EventOverviewKey} from "./event-overview-key";


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


	updateMaxAmount() {
		if (this.isMerch(this.event)) {
			this.maxAmount = this.event.getAmountOf(this.model.options.color, this.model.options.size);
		}
		else {
			this.maxAmount = this.event.capacity;
		}
		this.amountOptions = Array((this.maxAmount === undefined) ? 0 : this.maxAmount + 1).fill(0).map((_, i) => i);

		let shoppingCartItem = this.shoppingCartService.getItem(this.eventUtilityService.getEventType(this.event),
			this.event.id, Object.assign({}, this.model.options));

		if (shoppingCartItem) {
			this.model.amount = shoppingCartItem.amount;
		}
		else {
			this.model.amount = 0;
		}
		this.isPartOfShoppingCart = !!shoppingCartItem;
	}

	isMerch(event): event is Merchandise {
		return this.eventUtilityService.isMerchandise(event);
	}

	/**
	 *
	 */
	updateShoppingCart() {
		const shoppingCartItem = this.shoppingCartService.getItem(this.eventUtilityService.getEventType(this.event),
			this.event.id, Object.assign({}, this.model.options));
		const eventType = this.eventUtilityService.getEventType(this.event);
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
		let shoppingCartItem = this.shoppingCartService.getItem(this.eventUtilityService.getEventType(this.event),
			this.event.id, Object.assign({}, this.model.options));

		if (shoppingCartItem) {
			//delete
			this.shoppingCartService.deleteItem(this.eventUtilityService.getEventType(this.event), this.event.id, this.model.options);
			this.isPartOfShoppingCart = false;
		}
		else {
			//add
			this.shoppingCartService.pushItem(this.eventUtilityService.getEventType(item), {
				id: item.id,
				options: Object.assign({}, this.model.options),
				amount: this.model.amount
			});
			this.isPartOfShoppingCart = true;
		}
	}

}
