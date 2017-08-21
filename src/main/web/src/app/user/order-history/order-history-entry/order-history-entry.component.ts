import {Component, Input, OnInit} from '@angular/core';
import {Order} from "../../../shared/model/order";
import {OrderedItem} from "../../../shared/model/ordered-item";
import {NavigationService} from "../../../shared/services/navigation.service";
import {EventService} from "../../../shared/services/event.service";
import {Observable} from "rxjs/Observable";
import {EventUtilityService} from "../../../shared/services/event-utility.service";
import {Event} from "../../../shop/shared/model/event";

interface OrderedEventItem extends OrderedItem{
	event: Event,
	link: string
}

@Component({
	selector: 'memo-order-history-entry',
	templateUrl: './order-history-entry.component.html',
	styleUrls: ["./order-history-entry.component.scss"]
})
export class OrderHistoryEntryComponent implements OnInit {
	@Input() orderEntry: Order;
	orderedEventItems: OrderedEventItem[] = [];
	total:number = 0;

	constructor(private eventService: EventService) {
	}

	ngOnInit() {
		Observable.combineLatest(
			...this.orderEntry.orderedItems
				.map(item => this.eventService.getById(item.id)
					.map(event => ({
						event,
						link: "/" + EventUtilityService.getEventType(event) + "/" + event.id,
						...item
					}))
		))
			.subscribe(events => {
				this.orderedEventItems = events;
				this.total = events
					.reduce((acc, event) => acc + event.amount * event.price, 0);
			})
	}
}
