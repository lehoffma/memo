import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from "@angular/core";
import {Order} from "../../model/order";
import {OrderedItem} from "../../model/ordered-item";
import {EventUtilityService} from "../../services/event-utility.service";
import {OrderStatus, orderStatusToString} from "../../model/order-status";
import {UserBankAccountService} from "../../services/api/user-bank-account.service";
import {BankAccount} from "../../model/bank-account";
import {EMPTY, Observable} from "rxjs";
import {User} from "../../model/user";
import {UserService} from "../../services/api/user.service";
import {Event} from "../../../shop/shared/model/event";
import {MerchColor} from "../../../shop/shared/model/merch-color";

interface OrderedEventItem {
	originalItem: OrderedItem;
	status: {
		label: string;
		css: string;
		value: OrderStatus;
	};
	link: string;
	amount: number;
}

@Component({
	selector: "memo-order-renderer",
	templateUrl: "./order-renderer.component.html",
	styleUrls: ["./order-renderer.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderRendererComponent implements OnInit, OnChanges {
	@Input() orderEntry: Order;
	@Input() withActions = false;
	@Input() isOnDetailsPage = false;
	@Input() withItemActions = false;
	@Input() withRemove = true;
	orderedEventItems: OrderedEventItem[] = [];
	total: number = 0;

	bankAccount$: Observable<BankAccount> = EMPTY;
	user$: Observable<User> = EMPTY;

	@Output() onRemove: EventEmitter<Order> = new EventEmitter<Order>();
	@Output() onCancel: EventEmitter<OrderedItem> = new EventEmitter();

	constructor(private bankAccountService: UserBankAccountService,
				private userService: UserService) {
	}

	ngOnInit() {
		this.init();
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes["orderEntry"]) {
			this.init();
		}
	}

	init() {
		const events:OrderedEventItem[] = this.orderEntry.items
			.reduce((events: OrderedEventItem[], item) => {
				const eventId = item.item.id;
				//todo merge same orders together
				//	and think of a good way to cancel part of the order (and some of the grouped items)

				// const eventIndex = EventUtilityService.isMerchandise(item.item)
				// 	? events.findIndex(it => it.originalItem.item.id === eventId && it.originalItem.price === item.price && it.originalItem.color.name === item.color.name && it.originalItem.size === item.size)
				// 	: events.findIndex(it => it.originalItem.item.id === eventId && it.originalItem.price === item.price);
				// //it's not already part of the array
				// if (eventIndex === -1) {
					events.push({
						originalItem: item,
						link: "/shop/" + EventUtilityService.getEventType(item.item) + "/" + item.item.id,
						amount: 1,
						status: {
							css: orderStatusToString(item.status).replace(" ", "-"),
							label: orderStatusToString(item.status),
							value: item.status
						},
					})
				// } else {
				// 	events[eventIndex].amount++;
				// }
				return events;
			}, []);

		console.log(events);
		this.user$ = this.userService.getById(this.orderEntry.user);
		this.bankAccount$ = +(this.orderEntry.bankAccount) > 0 ? this.bankAccountService.getById(this.orderEntry.bankAccount) : EMPTY;
		this.orderedEventItems = events;
		this.total = events
			.reduce((acc, event) => acc + event.originalItem.price * event.amount, 0);
	}

	remove() {
		this.onRemove.emit(this.orderEntry);
	}

	cancel(item: OrderedEventItem) {
		this.onCancel.emit(item.originalItem);
	}

	canBeCancelled(item: OrderedEventItem) {
		return item.status.value !== OrderStatus.PARTICIPATED && item.status.value !== OrderStatus.CANCELLED;
	}
}
