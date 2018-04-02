import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {Order} from "../../../shared/model/order";
import {OrderedItem} from "../../../shared/model/ordered-item";
import {EventUtilityService} from "../../../shared/services/event-utility.service";
import {orderStatusToString} from "../../../shared/model/order-status";
import {UserBankAccountService} from "../../../shared/services/api/user-bank-account.service";
import {BankAccount} from "../../../shared/model/bank-account";
import {Observable} from "rxjs/Observable";
import {empty} from "rxjs/observable/empty";

interface OrderedEventItem extends OrderedItem {
	cssStatus: string;
	link: string;
	amount: number;
}

@Component({
	selector: "memo-order-history-entry",
	templateUrl: "./order-history-entry.component.html",
	styleUrls: ["./order-history-entry.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderHistoryEntryComponent implements OnInit {
	@Input() orderEntry: Order;
	@Input() withActions = false;
	orderedEventItems: OrderedEventItem[] = [];
	total: number = 0;

	bankAccount$: Observable<BankAccount> = empty();

	//todo show isDriver/needsTicket stuff
	@Output() onEdit: EventEmitter<Order> = new EventEmitter<Order>();
	@Output() onRemove: EventEmitter<Order> = new EventEmitter<Order>();

	constructor(private bankAccountService: UserBankAccountService) {
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
						cssStatus: orderStatusToString(item.status).replace(" ", "-"),
						status: orderStatusToString(item.status),
					})
				}
				else {
					events[eventIndex].amount++;
				}
				return events;
			}, []);

		this.bankAccount$ = +(this.orderEntry.bankAccount) > 0 ? this.bankAccountService.getById(this.orderEntry.bankAccount) : empty();
		this.orderedEventItems = events;
		this.total = events
			.reduce((acc, event) => acc + event.price * event.amount, 0);
	}


	edit() {
		this.onEdit.emit(this.orderEntry);
	}

	remove() {
		this.onRemove.emit(this.orderEntry);
	}
}
