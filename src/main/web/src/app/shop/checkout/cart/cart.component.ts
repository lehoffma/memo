import {Component, OnInit} from "@angular/core";
import {ShoppingCartService} from "../../../shared/services/shopping-cart.service";
import {EventService} from "../../../shared/services/event.service";
import {Observable} from "rxjs/Observable";
import {EventType} from "../../shared/model/event-type";

@Component({
	selector: "checkout-cart",
	templateUrl: "./cart.component.html",
	styleUrls: ["./cart.component.scss"]
})
export class CheckoutCartComponent implements OnInit {

	public shoppingCartItems = this.shoppingCartService.content
		.flatMap(content => {
			let getEventsfromShoppingCart = (contentkey: string, eventType: EventType) => {
				var events = [];
				for (let i = 0; i < content[contentkey].length; i++) {
					events[i] = this.eventService.getById(content[contentkey][i].id, {eventType: eventType});
				}
				return Observable.combineLatest(events)
					.map(events => {
						for (var i = 0; i < events.length; i++) {
							events[i] = {
								event: events[i],
								amount: content[contentkey][i].amount,
								options: content[contentkey][i].options
							}
						}
						return events;
					})
			}
			let tours = getEventsfromShoppingCart("tours", EventType.tours).defaultIfEmpty([]);
			let merch = getEventsfromShoppingCart("merch", EventType.merch).defaultIfEmpty([]);
			let partys = getEventsfromShoppingCart("partys", EventType.partys).defaultIfEmpty([]);
			return Observable.combineLatest(tours, merch, partys).map(eventsArray => {
				return {
					tours: eventsArray[0],
					merch: eventsArray[1],
					partys: eventsArray[2]
				}
			})
		});
	public totalAmount = this.shoppingCartItems.map(items => {
		return items.tours.reduce((prev, curr) => prev + curr.amount*curr.event.price, 0) +
			items.merch.reduce((prev, curr) => prev + curr.amount*curr.event.price, 0) +
			items.partys.reduce((prev, curr) => prev + curr.amount*curr.event.price, 0);
	})

	constructor(private shoppingCartService: ShoppingCartService, private eventService: EventService) {
	}

	ngOnInit() {

	}

}
