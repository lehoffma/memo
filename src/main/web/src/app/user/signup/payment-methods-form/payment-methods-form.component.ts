import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {PaymentInfo} from "./debit-input-form/payment-info";
import {SignUpSubmitEvent} from "../signup-submit-event";
import {User} from "../../../shared/model/user";

@Component({
	selector: "memo-payment-methods-form",
	templateUrl: "./payment-methods-form.component.html",
	styleUrls: ["./payment-methods-form.component.scss"]
})
export class PaymentMethodsFormComponent implements OnInit {
	@Input() user: User;
	@Input() loading: boolean = false;
	paymentMethod: { value: string, name: string };
	paymentMethods = [
		{
			value: "debit",
			name: "Lastschrift"
		},
		{
			value: "other",
			name: "Sonstiges"
		}];

	debitFormIsValid = false;
	debitInfo: PaymentInfo;

	@Output() onSubmit = new EventEmitter<SignUpSubmitEvent>();

	constructor() {
	}

	ngOnInit() {
	}


	saveDebitInfo({formIsValid, paymentInfo}) {
		this.debitFormIsValid = formIsValid;
		this.debitInfo = paymentInfo;
	}

	submit() {
		this.onSubmit.emit({
			paymentInfo: this.debitFormIsValid ? this.debitInfo : undefined
		})
	}
}
