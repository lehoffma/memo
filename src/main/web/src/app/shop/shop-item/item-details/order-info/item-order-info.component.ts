import {ChangeDetectionStrategy, Component, HostBinding, Input} from "@angular/core";
import {ShopEvent} from "../../../shared/model/event";
import {BehaviorSubject, combineLatest, Observable} from "rxjs";
import {Order} from "../../../../shared/model/order";
import {filter, map, mergeMap, takeUntil} from "rxjs/operators";
import {LogInService} from "../../../../shared/services/api/login.service";
import {OrderService} from "../../../../shared/services/api/order.service";
import {DestroyableComponent} from "../../../../util/destroyable.component";

@Component({
	selector: "memo-item-order-info",
	templateUrl: "./item-order-info.component.html",
	styleUrls: ["./item-order-info.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemOrderInfoComponent extends DestroyableComponent {
	event$: BehaviorSubject<ShopEvent> = new BehaviorSubject<ShopEvent>(null);

	@Input()
	set event(event: ShopEvent) {
		this.event$.next(event);
	}

	showOtherOrders: boolean = false;

	orderedItemDetails$: Observable<Order[]> = combineLatest([
		this.loginService.currentUser$,
		this.event$
	])
		.pipe(
			filter(([user, event]) => user !== null && event !== null),
			//check if there is one or more orders for this item and user
			mergeMap(([user, event]) => this.orderService.getOrdersForShopItem(event.id, user.id)),
			map(orders => orders.filter(order => order.items.length > 0)),
			filter(orders => orders.length > 0)
		);

	newestOrder$: Observable<Order> = this.orderedItemDetails$.pipe(
		filter(it => it.length > 0),
		map(it => it[0])
	);
	otherOrders$: Observable<Order[]> = this.orderedItemDetails$.pipe(
		filter(it => it.length > 1),
		map(it => it.slice(1))
	);

	hasOrders$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	@HostBinding("class.has-orders")
	get hasOrders() {
		return this.hasOrders$.getValue();
	}

	constructor(private loginService: LogInService,
				private orderService: OrderService) {
		super();
		this.orderedItemDetails$.pipe(takeUntil(this.onDestroy$))
			.subscribe(it => this.hasOrders$.next(it && it.length > 0));
	}
}
