import {Directive, Input} from "@angular/core";
import {AbstractControl, NG_VALIDATORS, ValidationErrors, Validator} from "@angular/forms";

@Directive({
	selector: "[memoDisplayError]",
	providers: [{provide: NG_VALIDATORS, useExisting: DisplayErrorDirective, multi: true}]
})
export class DisplayErrorDirective implements Validator {
	@Input() displayError: boolean;

	constructor() {
	}


	validate(control: AbstractControl): ValidationErrors | null {
		console.log(control);
		console.log(this.displayError);
		return this.displayError ? {"displayError": true} : null;
	}

}
