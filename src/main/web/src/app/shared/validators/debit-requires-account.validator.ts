import {ValidatorFn} from "@angular/forms";
import {PaymentMethod} from "../../shop/checkout/payment/payment-method";

export function debitRequiresAccountValidator(): ValidatorFn {
	return control => {
		const currentValue = control.value;

		if (currentValue.method !== PaymentMethod.DEBIT || currentValue.selectedAccount) {
			return null;
		}

		control.setErrors({debitRequiresAccount: true});
		return {debitRequiresAccount: true};
	}
}

