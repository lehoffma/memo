import {ValidatorFn} from "@angular/forms";
import {EventUtilityService} from "../services/event-utility.service";


export function isEventValidator(): ValidatorFn {
	return control => {
		const currentValue = control.value;

		if (EventUtilityService.isEvent(currentValue)) {
			return null;
		}

		control.setErrors({isNotAValidEvent: true});
	}
}
