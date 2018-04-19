import {AbstractControl, AsyncValidatorFn} from "@angular/forms";
import {map, mergeMap} from "rxjs/operators";
import {timer} from "rxjs/observable/timer";


export function emailExistsValidator(that: any): AsyncValidatorFn {
	return (control: AbstractControl) => {
		return timer(500)
			.pipe(
				mergeMap(() => that.userService.isUserEmailAlreadyInUse(control.value).pipe(
					map(res => {
						return res ? null : {emailDoesntExist: true};
					})
				))
			);
	}
}
