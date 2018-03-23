import {Component, OnInit} from "@angular/core";
import {ShoppingCartService} from "../../../shared/services/shopping-cart.service";
import {EventService} from "../../../shared/services/api/event.service";
import {ShoppingCartContent} from "../../../shared/model/shopping-cart-content";
import {ShoppingCartItem} from "app/shared/model/shopping-cart-item";
import {defaultIfEmpty, map, mergeMap} from "rxjs/operators";
import {combineLatest} from "rxjs/observable/combineLatest";
import {Observable} from "rxjs/Observable";

@Component({
	selector: "memo-cart",
	templateUrl: "./cart.component.html",
	styleUrls: ["./cart.component.scss"]
})
export class CartComponent implements OnInit {
	public shoppingCartItems: Observable<{ tours: ShoppingCartItem[], merch: ShoppingCartItem[], partys: ShoppingCartItem[] }> =
		this.shoppingCartService.content
			.pipe(
				mergeMap(content => {
					return combineLatest(
						this.getEventsFromShoppingCart(content, "tours")
							.pipe(defaultIfEmpty([])),
						this.getEventsFromShoppingCart(content, "merch")
							.pipe(defaultIfEmpty([])),
						this.getEventsFromShoppingCart(content, "partys")
							.pipe(defaultIfEmpty([]))
					)
						.pipe(
							map(([tours, merch, partys]) => ({
								tours,
								merch,
								partys
							}))
						);
				})
			);

	public totalAmount: Observable<number> = this.shoppingCartItems
		.pipe(
			map(items =>
				items.tours.reduce((prev, curr) => prev + curr.amount * curr.item.price, 0) +
				items.merch.reduce((prev, curr) => prev + curr.amount * curr.item.price, 0) +
				items.partys.reduce((prev, curr) => prev + curr.amount * curr.item.price, 0)
			)
		);

	public amountOfItems$: Observable<number> = this.shoppingCartItems
		.pipe(
			map(items => items.tours.length + items.merch.length + items.partys.length)
		);

	constructor(private shoppingCartService: ShoppingCartService,
				private eventService: EventService) {
	}

	ngOnInit() {

	}

	/**
	 *
	 * @param {ShoppingCartContent} content
	 * @param {string} contentKey
	 * @returns {Observable<ShoppingCartItem[]>}
	 */
	getEventsFromShoppingCart(content: ShoppingCartContent, contentKey: string): Observable<ShoppingCartItem[]> {
		return combineLatest(...content[contentKey]
			.map((item: ShoppingCartItem) => this.eventService.getById(item.id)
				.pipe(
					map(event => ({
						id: event.id,
						item: event,
						amount: item.amount,
						options: item.options
					}))
				))
		);
	};
}
