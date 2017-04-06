import {Component, OnInit} from "@angular/core";
import {ShoppingCartService} from "../../../shared/services/shopping-cart.service";
import {TourStore} from "../../../shared/stores/tour.store";
import {PartyStore} from "../../../shared/stores/party.store";
import {MerchStore} from "../../../shared/stores/merch.store";

@Component({
	selector: "checkout-cart",
	templateUrl: "./cart.component.html",
	styleUrls: ["./cart.component.scss"]
})
export class CheckoutCartComponent implements OnInit {
	public shoppingCartItems = this.shoppingCartService.content
		.map(content => [...content.merch, ...content.partys, ...content.tours]);

	constructor(private shoppingCartService: ShoppingCartService,
				private tourStore: TourStore,
				private partyStore: PartyStore,
				private merchStore: MerchStore) {

	}

	ngOnInit() {

	}

}
