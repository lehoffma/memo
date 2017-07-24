import {Component, Input, OnInit} from "@angular/core";
import {ShoppingCartService} from "../../../../shared/services/shopping-cart.service";
import {EventUtilityService} from "../../../../shared/services/event-utility.service";
import {CartItem} from "../cart-item";
import {Event} from "../../../shared/model/event";
import {StockService} from "../../../../shared/services/stock.service";
import {Observable} from "rxjs/Observable";
import {NavigationService} from "../../../../shared/services/navigation.service";


@Component({
	selector: "memo-cart-entry",
	templateUrl: "./cart-entry.component.html",
	styleUrls: ["./cart-entry.component.scss"]
})
export class CartEntryComponent implements OnInit {
	@Input() cartItem: CartItem;
	amountOptions = [];

	constructor(private shoppingCartService: ShoppingCartService,
				private navigationService: NavigationService,
				private stockService: StockService) {
	}


	ngOnInit() {
		let maxAmount: Observable<number>;
		//if the cart item is a merchandise object,
		//we have to extract the number from the item's stock (by calling the stockservice function)
		if (EventUtilityService.isMerchandise(this.cartItem.item)) {
			maxAmount = this.stockService.getByEventId(this.cartItem.item.id)
				.map(stock => stock
					// we have to consider the selected color and size attributes
					.filter(stockItem =>
						stockItem.color.hex === this.cartItem.options.color.hex
						&& stockItem.size === this.cartItem.options.size
					)
					.reduce((acc, stockItem) => acc + stockItem.amount, 0));
		} else {
			maxAmount = Observable.of(this.cartItem.item.capacity);
		}
		maxAmount.subscribe(maxAmount => {
			for (let i = 0; i <= maxAmount; i++) {
				this.amountOptions.push(i);
			}
		})
	}

	get linkToItem(){
		let category = EventUtilityService.getEventType(this.cartItem.item);
		return `/${category}/${this.cartItem.item.id}`
	}

	/**
	 * Delegates the call to the isMerchandise function of the util service (so we can use it in the template)
	 * @param result
	 * @returns {boolean}
	 */
	itemIsMerch(result: Event) {
		return EventUtilityService.isMerchandise(result);
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
	 * Callback of the amount dropdown
	 * Pushes a new amount value to the cart service
	 */
	updateEventAmount() {
		const eventType = EventUtilityService.getEventType(this.cartItem.item);
		this.shoppingCartService.pushItem(eventType, {
			id: this.cartItem.item.id,
			amount: this.cartItem.amount,
			options: this.cartItem.options
		});
	}
}

