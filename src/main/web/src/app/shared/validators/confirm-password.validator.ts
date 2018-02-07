import {ValidatorFn} from "@angular/forms";

export function confirmPasswordValidator(): ValidatorFn {
	return control => {
		if (!control) {
			return null;
		}
		const password = control.get("password").value;
		const confirmedPassword = control.get("confirmedPassword").value;
		if (password !== confirmedPassword) {
			control.get("confirmedPassword").setErrors({passwordDoesNotMatch: true});
		}
		else {
			return null;
		}
	}
}
