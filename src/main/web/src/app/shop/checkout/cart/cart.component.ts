import {Component, OnInit} from "@angular/core";
import {ShoppingCartService} from "../../../shared/services/shopping-cart.service";

@Component({
	selector: "checkout-cart",
	templateUrl: "./cart.component.html",
	styleUrls: ["./cart.component.scss"]
})
export class CheckoutCartComponent implements OnInit {
	public shoppingCartItems = this.shoppingCartService.content
		.map(content => [...content.merch, ...content.partys, ...content.tours]);

	constructor(private shoppingCartService: ShoppingCartService) {

	}

	ngOnInit() {

	}

}
