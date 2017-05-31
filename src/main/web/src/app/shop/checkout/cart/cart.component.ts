import {Component, OnInit} from "@angular/core";
import {ShoppingCartService} from "../../../shared/services/shopping-cart.service";
import {EventService} from "../../../shared/services/event.service";
import {Observable} from "rxjs/Observable";
import {EventType} from "../../shared/model/event-type";
import {CartItem} from "./cart-item";

@Component({
	selector: "checkout-cart",
	templateUrl: "./cart.component.html",
	styleUrls: ["./cart.component.scss"]
})
export class CheckoutCartComponent implements OnInit {

	public shoppingCartItems: Observable<{ tours: CartItem[], merch: CartItem[], partys: CartItem[] }> =
		this.shoppingCartService.content.flatMap(content => {
			let getEventsFromShoppingCart = (contentKey: string, eventType: EventType): Observable<CartItem[]> => {
				const events = [];
				for (let i = 0; i < content[contentKey].length; i++) {
					events[i] = this.eventService.getById(content[contentKey][i].id, {eventType: eventType});
				}
				return Observable.combineLatest(events)
					.map(events => {
						for (let i = 0; i < events.length; i++) {
							events[i] = {
								item: events[i],
								amount: content[contentKey][i].amount,
								options: content[contentKey][i].options
							}
						}
						return events;
					})
			};
			let tours = getEventsFromShoppingCart("tours", EventType.tours).defaultIfEmpty([]);
			let merch = getEventsFromShoppingCart("merch", EventType.merch).defaultIfEmpty([]);
			let partys = getEventsFromShoppingCart("partys", EventType.partys).defaultIfEmpty([]);
			return Observable.combineLatest(tours, merch, partys).map(eventsArray => {
				return {
					tours: eventsArray[0],
					merch: eventsArray[1],
					partys: eventsArray[2]
				}
			})
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

}
