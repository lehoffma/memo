import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from "@angular/core";
import {OrderedItem} from "../../model/ordered-item";
import {OrderedItemInputFormService} from "./ordered-item-input-form.service";
import {OrderStatus, OrderStatusList, orderStatusToString} from "../../model/order-status";
import {BehaviorSubject, combineLatest, Subject} from "rxjs";
import {filter, takeUntil} from "rxjs/operators";
import {getDiscountedPrice} from "../../renderers/price-renderer/discount";

@Component({
	selector: "memo-ordered-item-input-form",
	templateUrl: "./ordered-item-input-form.component.html",
	styleUrls: ["./ordered-item-input-form.component.scss"],
	providers: [OrderedItemInputFormService]
})
export class OrderedItemInputFormComponent implements OnInit, OnDestroy {
	@Output() onCancel: EventEmitter<any> = new EventEmitter<any>();
	@Output() onSubmit: EventEmitter<OrderedItem> = new EventEmitter<OrderedItem>();
	statusOptions: OrderStatus[] = OrderStatusList;
	orderToString = orderStatusToString;

	orderedItem$: BehaviorSubject<OrderedItem> = new BehaviorSubject(null);
	discountedPrice$: BehaviorSubject<number> = new BehaviorSubject(0);
	onDestroy$ = new Subject();

	constructor(public inputFormService: OrderedItemInputFormService) {
		combineLatest([
			this.inputFormService.addOrderedItemForm.get("price").valueChanges.pipe(filter(price => price !== undefined)),
			this.orderedItem$.pipe(filter(it => it !== null)),
		])
			.pipe(
				takeUntil(this.onDestroy$)
			).subscribe(([price, orderedItem]) => {
			this.discountedPrice$.next(
				getDiscountedPrice(price, orderedItem.discounts || [])
			)
		})
	}

	@Input() set orderedItem(orderedItem: OrderedItem) {
		this.inputFormService.setOrderedItem(orderedItem);
		this.orderedItem$.next(orderedItem);
	}

	ngOnInit() {
	}

	cancel() {
		this.onCancel.emit(true);
	}

	submit() {
		this.onSubmit.emit(this.inputFormService.addOrderedItemForm.value);
	}

	ngOnDestroy(): void {
		this.onDestroy$.next(true);
	}
}
