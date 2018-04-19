import {Component, EventEmitter, OnInit, Output} from "@angular/core";
import {PaymentMethod} from "./payment-method";

@Component({
	selector: "memo-payment-selection",
	templateUrl: "./payment-method-selection.component.html",
	styleUrls: ["./payment-method-selection.component.scss"]
})
export class PaymentMethodSelectionComponent implements OnInit {
	paymentMethods = [
		PaymentMethod.CASH,
		PaymentMethod.DEBIT,
		PaymentMethod.TRANSFER
	];
	@Output() methodSelected: EventEmitter<PaymentMethod> = new EventEmitter();

	constructor() {
	}

	_selectedMethod: PaymentMethod;

	get selectedMethod() {
		return this._selectedMethod;
	}

	set selectedMethod(method: PaymentMethod) {
		this._selectedMethod = method;
		this.methodSelected.emit(method);
	}

	ngOnInit() {
	}

}
