import {ChangeDetectionStrategy, Component, Input, OnInit} from "@angular/core";
import {FormGroup} from "@angular/forms";
import {paymentMethodList} from "../../../../checkout/payment/payment-method";
import {numberLimitToString} from "./payment-method-limit-util";
import {PaymentConfig} from "../../../../shared/model/event";

@Component({
	selector: "memo-payment-method-configuration",
	templateUrl: "./payment-method-configuration.component.html",
	styleUrls: ["./payment-method-configuration.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentMethodConfigurationComponent implements OnInit {
	@Input() formGroup: FormGroup;

	methods = paymentMethodList();
	limitOptions: (string)[] = [
		"Kein Limit",
		...Array.from(new Array(20), (x, i) => "" + (i + 1))
	];

	constructor() {
	}


	@Input() set previousValue(previousValue: PaymentConfig) {
		if (!previousValue) {
			return;
		}

		this.formGroup.get("limit").patchValue(numberLimitToString(previousValue.limit));
		this.formGroup.get("methods").patchValue(previousValue.methods);
	}


	ngOnInit() {
	}

}
