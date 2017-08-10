import {Component, OnInit} from "@angular/core";
import {ShoppingCartService} from "../../../shared/services/shopping-cart.service";
import {EventService} from "../../../shared/services/event.service";
import {Observable} from "rxjs/Observable";
import {CartItem} from "./cart-item";
import {ShoppingCartContent} from "../../../shared/model/shopping-cart-content";
import {ShoppingCartItem} from "app/shared/model/shopping-cart-item";

@Component({
	selector: "checkout-cart",
	templateUrl: "./cart.component.html",
	styleUrls: ["./cart.component.scss"]
})
export class CheckoutCartComponent implements OnInit {
	public shoppingCartItems: Observable<{ tours: CartItem[], merch: CartItem[], partys: CartItem[] }> =
		this.shoppingCartService.content.flatMap((content: ShoppingCartContent) => {
			let tours = this.getEventsFromShoppingCart(content, "tours").defaultIfEmpty([]);
			let merch = this.getEventsFromShoppingCart(content, "merch").defaultIfEmpty([]);
			let partys = this.getEventsFromShoppingCart(content, "partys").defaultIfEmpty([]);
			return Observable.combineLatest(tours, merch, partys)
				.map(([tours, merch, partys]) => ({
					tours,
					merch,
					partys
				}));
		});

	public totalAmount: Observable<number> = this.shoppingCartItems.map(items =>
		items.tours.reduce((prev, curr) => prev + curr.amount * curr.item.price, 0) +
		items.merch.reduce((prev, curr) => prev + curr.amount * curr.item.price, 0) +
		items.partys.reduce((prev, curr) => prev + curr.amount * curr.item.price, 0)
	);

	constructor(private shoppingCartService: ShoppingCartService, private eventService: EventService) {
	}

	ngOnInit() {

	}

	/**
	 *
	 * @param {ShoppingCartContent} content
	 * @param {string} contentKey
	 * @returns {Observable<CartItem[]>}
	 */
	getEventsFromShoppingCart(content: ShoppingCartContent, contentKey: string): Observable<CartItem[]> {
		return Observable.combineLatest(...content[contentKey]
			.map((item: ShoppingCartItem) => this.eventService.getById(item.id)
				.map(event => ({
					item: event,
					amount: item.amount,
					options: item.options
				}))));
	};
}
