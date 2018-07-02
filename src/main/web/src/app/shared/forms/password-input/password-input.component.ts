import {ChangeDetectionStrategy, Component, Input, OnInit} from "@angular/core";
import {ControlValueAccessor, FormGroup, NG_VALUE_ACCESSOR} from "@angular/forms";

@Component({
	selector: "memo-password-input",
	templateUrl: "./password-input.component.html",
	styleUrls: ["./password-input.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush,
	providers: [{
		provide: NG_VALUE_ACCESSOR,
		useExisting: PasswordInputComponent,
		multi: true
	}],
})
export class PasswordInputComponent implements OnInit, ControlValueAccessor {
	@Input() form: FormGroup;
	@Input() required: boolean = true;
	@Input() repeatPassword: boolean = true;
	@Input() showStrengthBar: boolean = true;
	_onChange;

	constructor() {
	}

	ngOnInit() {
	}

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
