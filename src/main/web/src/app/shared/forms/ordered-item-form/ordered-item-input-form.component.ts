import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {OrderedItem} from "../../model/ordered-item";
import {OrderedItemInputFormService} from "./ordered-item-input-form.service";
import {OrderStatus, OrderStatusList, orderStatusToString} from "../../model/order-status";

@Component({
	selector: "memo-ordered-item-input-form",
	templateUrl: "./ordered-item-input-form.component.html",
	styleUrls: ["./ordered-item-input-form.component.scss"],
	providers: [OrderedItemInputFormService]
})
export class OrderedItemInputFormComponent implements OnInit {
	@Output() onCancel: EventEmitter<any> = new EventEmitter<any>();
	@Output() onSubmit: EventEmitter<OrderedItem> = new EventEmitter<OrderedItem>();
	statusOptions: OrderStatus[] = OrderStatusList;
	orderToString = orderStatusToString;

	constructor(public inputFormService: OrderedItemInputFormService) {
	}

	@Input() set orderedItem(orderedItem: OrderedItem) {
		this.inputFormService.setOrderedItem(orderedItem);
	}

	ngOnInit() {
	}

	cancel() {
		this.onCancel.emit(true);
	}

	submit() {
		this.onSubmit.emit(this.inputFormService.addOrderedItemForm.value);
	}
}
