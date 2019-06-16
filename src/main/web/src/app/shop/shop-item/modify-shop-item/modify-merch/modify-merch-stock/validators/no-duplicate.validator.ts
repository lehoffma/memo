import {FormArray, FormGroup, ValidatorFn} from "@angular/forms";
import {MerchStock} from "../../../../../shared/model/merch-stock";
import {MerchColor} from "../../../../../shared/model/merch-color";

export function noDuplicateSizesValidator(): ValidatorFn {
	return control => {
		if (!control) {
			return null;
		}

		const formArray = control as FormArray;

		const controls: FormGroup[] = formArray.controls as FormGroup[];

		let sizes: { [size: string]: boolean } = {};
		let hasErrors = false;

		//controls.size => duplicate gets error added
		controls.forEach(control => {
			const merchStock: MerchStock = control.value;
			if (sizes[merchStock.size]) {
				hasErrors = true;
				control.get("size").setErrors({duplicateSize: true});
			} else {
				sizes[merchStock.size] = true;
			}
		});

		if (!hasErrors) {
			return null;
		}
	}
}


export function noDuplicateColorValidator(colors: MerchColor[]): ValidatorFn {
	return control => {
		if (!control) {
			return null;
		}

		const formGroup = control as FormGroup;
		const value = formGroup.value;

		const color = colors.find(color => color.name === value.name && color.hex === value.hex);
		if (color !== undefined) {
			control.setErrors({duplicateColor: true}, {emitEvent: true});
			return {duplicateColor: true};
		} else {
			return null;
		}
	}
}
