import {ValidatorFn} from "@angular/forms";

declare var IBAN;

export function ibanValidator(): ValidatorFn {
	return control => {
		const currentValue = control.value;

		if (IBAN.isValid(currentValue)) {
			return null;
		}

		control.setErrors({invalidIBAN: true});
		return {invalidIBAN: true};
	}
}
