import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {PaymentMethod} from "../../../shop/checkout/payment/payment-method";

@Component({
	selector: "memo-radio-selection",
	templateUrl: "./radio-selection.component.html",
	styleUrls: ["./radio-selection.component.scss"]
})
export class RadioSelectionComponent<T> implements OnInit {
	@Output() onSelected: EventEmitter<T> = new EventEmitter();
	@Input() options: T[];

	constructor() {
	}

	_selected: T;

	get selected() {
		return this._selected;
	}

	set selected(method: T) {
		this._selected = method;
		this.onSelected.emit(method);
	}

	ngOnInit() {
	}

}
