import {FormGroup, ValidatorFn} from "@angular/forms";

export function paymentMethodLimitationValidator(): ValidatorFn {
	return control => {
		const formGroup = control as FormGroup;
		const currentValue = formGroup.value.methods;
		const atLeastOneMethodSelected = Object.keys(currentValue).some(key => currentValue[key]);

		if (!atLeastOneMethodSelected) {
			control.setErrors({noPaymentMethodSelected: true});
			return {noPaymentMethodSelected: true}
		}

		return null;
	}
}
