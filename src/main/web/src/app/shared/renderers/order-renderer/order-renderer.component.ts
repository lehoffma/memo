import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges} from "@angular/core";
import {Order} from "../../model/order";
import {OrderedItem} from "../../model/ordered-item";
import {EventUtilityService} from "../../services/event-utility.service";
import {OrderStatus, orderStatusTooltip, orderStatusToString} from "../../model/order-status";
import {UserBankAccountService} from "../../services/api/user-bank-account.service";
import {BankAccount} from "../../model/bank-account";
import {BehaviorSubject, EMPTY, Observable, Subject} from "rxjs";
import {User} from "../../model/user";
import {UserService} from "../../services/api/user.service";
import {DiscountService} from "../../../shop/shared/services/discount.service";
import {MatDialog, MatSnackBar} from "@angular/material";
import {getDiscountedPrice} from "../price-renderer/discount";
import {DiscountOverlayComponent} from "../price-renderer/discount-overlay.component";

interface OrderedEventItem {
	originalItem: OrderedItem;
	status: {
		label: string;
		css: string;
		value: OrderStatus;
		tooltip?: string;
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
export class OrderRendererComponent implements OnInit, OnDestroy, OnChanges {
	@Input() orderEntry: Order;
	@Input() withActions = false;
	@Input() isOnDetailsPage = false;
	@Input() withItemActions = false;
	@Input() withRemove = true;
	@Input() canSeeDescription = false;
	orderedEventItems: OrderedEventItem[] = [];
	total$: BehaviorSubject<number> = new BehaviorSubject(null);

	bankAccount$: Observable<BankAccount> = EMPTY;
	user$: Observable<User> = EMPTY;

	@Output() onRemove: EventEmitter<Order> = new EventEmitter<Order>();
	@Output() onCancel: EventEmitter<OrderedItem> = new EventEmitter();

	onDestroy$ = new Subject();

	constructor(private bankAccountService: UserBankAccountService,
				private snackBar: MatSnackBar,
				private matDialog: MatDialog,
				private discountService: DiscountService,
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

	ngOnDestroy(): void {
		this.onDestroy$.next(true);
	}


	init() {
		const events: OrderedEventItem[] = this.orderEntry.items
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
						tooltip: orderStatusTooltip(item.status),
						value: item.status
					},
				});
				// } else {
				// 	events[eventIndex].amount++;
				// }
				return events;
			}, []);

		this.user$ = this.userService.getById(this.orderEntry.user);
		this.bankAccount$ = +(this.orderEntry.bankAccount) > 0 ? this.bankAccountService.getById(this.orderEntry.bankAccount) : EMPTY;
		this.orderedEventItems = events;

		this.total$.next(events.reduce((acc, event) => {
			return acc + this.getPrice(event.originalItem);
		}, 0));
	}

	getPrice(orderedItem: OrderedItem): number {
		const discounts = orderedItem.discounts;
		if (!discounts) {
			return orderedItem.price;
		}
		return getDiscountedPrice(orderedItem.price, discounts)
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

	openDiscountDialog(item: OrderedEventItem) {
		this.matDialog.open(DiscountOverlayComponent, {
			data: {
				basePrice: item.originalItem.price,
				price: this.getPrice(item.originalItem),
				discounts: item.originalItem.discounts
			}
		})
	}
}
