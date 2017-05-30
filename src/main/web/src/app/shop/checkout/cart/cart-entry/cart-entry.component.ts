import {Component, Input, OnInit} from "@angular/core";
import {ShoppingCartService} from "../../../../shared/services/shopping-cart.service";
import {EventUtilityService} from "../../../../shared/services/event-utility.service";
import {CartItem} from "../cart-item";


@Component({
	selector: "memo-cart-entry",
	templateUrl: "./cart-entry.component.html",
	styleUrls: ["./cart-entry.component.scss"]
})
export class CartEntryComponent implements OnInit{
	@Input() cartItem: CartItem;
	amountOptions = [];

	constructor(private shoppingCartService: ShoppingCartService, private eventUtilityService: EventUtilityService) {
	}


	ngOnInit() {
		let maxAmount: number;
		if (this.eventUtilityService.isMerchandise(this.cartItem.item)) {
			maxAmount = this.cartItem.item.getAmountOf(this.cartItem.options.color, this.cartItem.options.size)
		} else {
			maxAmount = this.cartItem.item.capacity;
		}
		for (let i = 0; i <= maxAmount; i++) {
			this.amountOptions.push(i);
		}
	}

	itemIsMerch(result: Event) {
		return this.eventUtilityService.isMerchandise(result);
	}
	deleteItem(){
		const eventType = this.eventUtilityService.getEventType(this.cartItem.item);
		if (this.cartItem.amount > 0) {
			this.shoppingCartService.pushItem(eventType, {
				id: this.cartItem.item.id,
				amount: this.cartItem.amount=0,
				options: this.cartItem.options
			})
		}

	}


	updateEventAmount() {
		const eventType = this.eventUtilityService.getEventType(this.cartItem.item);
		if (this.cartItem.amount > 0) {
			this.shoppingCartService.pushItem(eventType, {
				id: this.cartItem.item.id,
				amount: this.cartItem.amount,
				options: this.cartItem.options
			})
		}
		else {
			this.shoppingCartService.deleteItem(eventType, this.cartItem.item.id, this.cartItem.options);
		}
	}
}

