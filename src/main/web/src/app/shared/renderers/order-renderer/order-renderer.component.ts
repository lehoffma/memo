import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from "@angular/core";
import {Order} from "../../model/order";
import {OrderedItem} from "../../model/ordered-item";
import {EventUtilityService} from "../../services/event-utility.service";
import {orderStatusToString} from "../../model/order-status";
import {UserBankAccountService} from "../../services/api/user-bank-account.service";
import {BankAccount} from "../../model/bank-account";
import {EMPTY, Observable} from "rxjs";
import {User} from "../../model/user";
import {UserService} from "../../services/api/user.service";

interface OrderedEventItem extends OrderedItem {
	cssStatus: string;
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
	@Input() withShow = true;
	@Input() withRemove = true;
	orderedEventItems: OrderedEventItem[] = [];
	total: number = 0;

	bankAccount$: Observable<BankAccount> = EMPTY;
	user$: Observable<User> = EMPTY;

	//todo show isDriver/needsTicket stuff
	@Output() onRemove: EventEmitter<Order> = new EventEmitter<Order>();

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

		this.user$ = this.userService.getById(this.orderEntry.user);
		this.bankAccount$ = +(this.orderEntry.bankAccount) > 0 ? this.bankAccountService.getById(this.orderEntry.bankAccount) : EMPTY;
		this.orderedEventItems = events;
		this.total = events
			.reduce((acc, event) => acc + event.price * event.amount, 0);
	}

	remove() {
		this.onRemove.emit(this.orderEntry);
	}
}
