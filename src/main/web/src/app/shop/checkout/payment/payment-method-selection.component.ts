import {Component, EventEmitter, OnInit, Output} from "@angular/core";
import {PaymentMethod} from "./payment-method";

@Component({
	selector: "memo-payment-selection",
	templateUrl: "./payment-method-selection.component.html",
	styleUrls: ["./payment-method-selection.component.scss"]
})
export class PaymentMethodSelectionComponent implements OnInit {
	paymentMethodEnum = PaymentMethod;
	paymentMethods = [
		PaymentMethod.CASH,
		PaymentMethod.DEBIT,
		PaymentMethod.TRANSFER,
		PaymentMethod.PAYPAL
	];


	_selectedMethod: PaymentMethod;
	@Output() methodSelected: EventEmitter<PaymentMethod> = new EventEmitter();

	get selectedMethod() {
		return this._selectedMethod;
	}

	set selectedMethod(method: PaymentMethod) {
		this._selectedMethod = method;
		this.methodSelected.emit(method);
	}

	constructor() {
	}

	ngOnInit() {
	}

}
