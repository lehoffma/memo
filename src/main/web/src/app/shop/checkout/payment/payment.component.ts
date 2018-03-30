import {Component, Input, OnInit} from "@angular/core";
import {PaymentMethod} from "./payment-method";
import {FormGroup} from "@angular/forms";

@Component({
	selector: "memo-payment",
	templateUrl: "./payment.component.html",
	styleUrls: ["./payment.component.scss"]
})
export class PaymentComponent implements OnInit {
	@Input() formGroup: FormGroup;

	paymentMethodEnum = PaymentMethod;
	loading = false;

	constructor() {
	}

	ngOnInit() {
		//todo https://developer.paypal.com/demo/checkout/#/pattern/client
	}

	/**
	 *
	 * @param {PaymentMethod} method
	 */
	updateSelectedMethod(method: PaymentMethod) {
		this.formGroup.get("method").patchValue(method);
	}
}
