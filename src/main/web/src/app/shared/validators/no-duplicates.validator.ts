import {ValidatorFn} from "@angular/forms";


export function noDuplicatesValidator<T>(array: T[]): ValidatorFn {
	return control => {
		const currentValue: T = control.value;

		if (array.indexOf(currentValue) !== -1) {
			control.setErrors({duplicate: true});
			return {duplicate: true};
		}

		return null;
	}
}
