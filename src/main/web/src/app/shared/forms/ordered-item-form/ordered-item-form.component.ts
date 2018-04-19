import {Component, Input, OnInit} from "@angular/core";
import {FormGroup} from "@angular/forms";
import {ModifyOrderService} from "../../../shop/shop-item/modify-shop-item/modify-order/modify-order.service";
import {OrderedItem} from "../../model/ordered-item";

@Component({
	selector: "memo-ordered-item-form",
	templateUrl: "./ordered-item-form.component.html",
	styleUrls: ["./ordered-item-form.component.scss"],
	providers: [ModifyOrderService]
})
export class OrderedItemFormComponent implements OnInit {
	@Input() formGroup: FormGroup;
	showInlineForm = -1;
	showNewItemForm = false;

	constructor() {
	}

	ngOnInit() {
	}

	/**
	 *
	 * @param {OrderedItem} item
	 * @param {number} index
	 */
	updateItem(item: OrderedItem, index: number = this.formGroup.get("items").value.length) {
		const currentValue = this.formGroup.get("items").value;
		currentValue.splice(index, 1, item);
		this.formGroup.get("items").setValue([...currentValue]);
	}

	removeItem(item: OrderedItem, index: number) {
		const currentValue = this.formGroup.get("items").value;
		currentValue.splice(index, 1);
		this.formGroup.get("items").setValue([...currentValue]);
	}

}
