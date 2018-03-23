import {AbstractControl, AsyncValidatorFn, ValidatorFn} from "@angular/forms";
import {map, mergeMap} from "rxjs/operators";
import {timer} from "rxjs/observable/timer";


export function emailAlreadyTakenValidator(that: any): AsyncValidatorFn {
	return (control: AbstractControl) => {
		return timer(500)
			.pipe(
				mergeMap(() => that.userService.isUserEmailAlreadyInUse(control.value).pipe(
					map(res => {
						return !res ? null : {emailTaken: true};
					})
				))
			);
	}
}
