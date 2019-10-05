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
	@Input() allowedMethods: {
		[method in PaymentMethod]: boolean;
	};
	@Input() bankAccountError: any;

	paymentMethodEnum = PaymentMethod;
	loading = false;

	constructor() {
	}

	ngOnInit() {
		//todo https://developer.paypal.com/demo/checkout/#/pattern/client
	}

	public get options(): PaymentMethod[] {
		if (!this.allowedMethods) {
			return [];
		}
		return Object.keys(this.allowedMethods).filter(key => this.allowedMethods[key]) as PaymentMethod[];
	}

	/**
	 *
	 * @param {PaymentMethod} method
	 */
	updateSelectedMethod(method: PaymentMethod) {
		this.formGroup.get("method").patchValue(method);
	}
}
