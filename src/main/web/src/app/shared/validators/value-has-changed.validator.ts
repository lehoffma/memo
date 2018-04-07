import {ValidatorFn} from "@angular/forms";

export function valueHasChangedValidator<T>(previous: T): ValidatorFn {
	return control => {
		const currentValue = control.value;

		if (currentValue !== previous) {
			return null;
		}

		control.setErrors({hasNotChanged: true});
		return {hasNotChanged: true};
	}
}
