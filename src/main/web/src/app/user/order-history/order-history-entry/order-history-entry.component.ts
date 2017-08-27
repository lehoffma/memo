import {Component, Input, OnInit} from '@angular/core';
import {Order} from "../../../shared/model/order";
import {OrderedItem} from "../../../shared/model/ordered-item";
import {EventUtilityService} from "../../../shared/services/event-utility.service";

interface OrderedEventItem extends OrderedItem {
	link: string;
	amount: number;
}

@Component({
	selector: 'memo-order-history-entry',
	templateUrl: './order-history-entry.component.html',
	styleUrls: ["./order-history-entry.component.scss"]
})
export class OrderHistoryEntryComponent implements OnInit {
	@Input() orderEntry: Order;
	orderedEventItems: OrderedEventItem[] = [];
	total: number = 0;

	constructor() {
	}

	ngOnInit() {
		let events = this.orderEntry.orderedItems
			.map(item => ({
				link: "/" + EventUtilityService.getEventType(item.event) + "/" + item.event.id,
				amount: 1,	//todo reduce duplicate entries
				...item
			}));

		this.orderedEventItems = events;
		this.total = events
			.reduce((acc, event) => acc + event.price, 0);
	}
}
