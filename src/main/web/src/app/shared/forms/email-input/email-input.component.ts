import {Component, Input, OnInit} from "@angular/core";
import {AbstractControl, ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";

@Component({
	selector: "memo-email-input",
	templateUrl: "./email-input.component.html",
	styleUrls: ["./email-input.component.scss"],
	providers: [{
		provide: NG_VALUE_ACCESSOR,
		useExisting: EmailInputComponent,
		multi: true
	}],
})
export class EmailInputComponent implements OnInit, ControlValueAccessor {
	@Input() form: AbstractControl;

	constructor() {
	}

	ngOnInit() {
	}

	_onChange;

	registerOnChange(fn: any): void {
		this._onChange = fn;
	}

	registerOnTouched(fn: any): void {
	}

	setDisabledState(isDisabled: boolean): void {
		if (isDisabled) {
			this.form.disable();
		}
		else {
			this.form.enable();
		}
	}

	writeValue(obj: any): void {
		this.form.patchValue(obj);
	}
}
