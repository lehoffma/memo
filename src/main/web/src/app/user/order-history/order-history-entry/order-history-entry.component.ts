import {ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';
import {Order} from "../../../shared/model/order";
import {OrderedItem} from "../../../shared/model/ordered-item";
import {EventUtilityService} from "../../../shared/services/event-utility.service";
import {orderStatusToString} from "../../../shared/model/order-status";

interface OrderedEventItem extends OrderedItem {
	link: string;
	amount: number;
}

@Component({
	selector: 'memo-order-history-entry',
	templateUrl: './order-history-entry.component.html',
	styleUrls: ["./order-history-entry.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderHistoryEntryComponent implements OnInit {
	@Input() orderEntry: Order;
	orderedEventItems: OrderedEventItem[] = [];
	total: number = 0;

	//todo: if bankAccount => show iban/bic (but with ***)
	constructor() {
	}

	ngOnInit() {
		const events = this.orderEntry.items
			.reduce((events, item) => {
				const eventId = item.item.id;
				const eventIndex = EventUtilityService.isMerchandise(item.item)
					? events.findIndex(it => it.item.id === eventId && it.color.name === item.color.name && it.size === item.size)
					: events.findIndex(it => it.item.id === eventId);
				//it's not already part of the array
				if (eventIndex === -1) {
					events.push({
						link: "/" + EventUtilityService.getEventType(item.item) + "/" + item.item.id,
						amount: 1,
						...item,
						status: orderStatusToString(item.status),
					})
				}
				else {
					events[eventIndex].amount++;
				}
				return events;
			}, []);

		this.orderedEventItems = events;
		this.total = events
			.reduce((acc, event) => acc + event.price * event.amount, 0);
	}
}
