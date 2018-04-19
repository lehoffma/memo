import {Directive, Input} from "@angular/core";
import {FormControl} from "@angular/forms";

@Directive({
	selector: "[formControl][disableIf]"
})
export class DisableIfDirective {
	@Input() formControl: FormControl;

	constructor() {
	}

	get disableIf(): boolean { // getter, not needed, but here only to completude
		return !!this.formControl && this.formControl.disabled;
	}

	@Input("disableIf") set disableIf(s: boolean) {
		if (!this.formControl) return;
		else if (s) this.formControl.disable();
		else this.formControl.enable();
	}
}
