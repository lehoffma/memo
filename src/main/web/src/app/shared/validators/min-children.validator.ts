import {FormGroup, ValidatorFn} from "@angular/forms";


export function minChildrenValidator(amount: number): ValidatorFn {
	return control => {
		const currentValue = control as FormGroup;
		const amountOfChildren = Object.keys(currentValue.controls).length;

		if (amountOfChildren < amount) {
			control.setErrors({notEnoughChildren: true});
			return {notEnoughChildren: true};
		}

		return null;
	}
}
