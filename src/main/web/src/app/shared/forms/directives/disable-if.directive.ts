import {Directive, Input} from "@angular/core";
import {AbstractControl, FormControl, FormGroup} from "@angular/forms";

@Directive({
	selector: "[formControl][disableIf],[formGroup][disableIf]"
})
export class DisableIfDirective {
	@Input() formControl: FormControl;
	@Input() formGroup: FormGroup;

	constructor() {
	}

	get disableIf(): boolean { // getter, not needed, but here only to completude
		return !!this.formControl && this.formControl.disabled;
	}

	private getControl(): AbstractControl{
		if(this.formControl){
			return this.formControl;
		}
		if(this.formGroup){
			return this.formGroup;
		}
	}

	@Input("disableIf") set disableIf(s: boolean) {
		if (!this.formControl && !this.formGroup) return;
		else if (s) this.getControl().disable();
		else this.getControl().enable();
	}
}
