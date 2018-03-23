import {ValidatorFn} from "@angular/forms";
import {isNullOrUndefined} from "util";

export function minArraySizeValidator(minSize: number): ValidatorFn {
	return control => {
		if (!control) {
			return null;
		}
		const array: any[] = control.value
			.filter(it => !isNullOrUndefined(it));

		if (array.length < minSize) {
			control.setErrors({minArraySize: true});
		}
		else {
			return null;
		}
	}
}
