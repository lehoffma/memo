import {Component, EventEmitter, HostListener, Input, OnInit, Output, ViewChild} from "@angular/core";
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR} from "@angular/forms";
import { MatCheckbox } from "@angular/material/checkbox";

@Component({
	selector: "memo-filter-option-row",
	templateUrl: "./filter-option-row.component.html",
	styleUrls: ["./filter-option-row.component.scss"],
	providers: [{
		provide: NG_VALUE_ACCESSOR,
		useExisting: FilterOptionRowComponent,
		multi: true
	}]
})
export class FilterOptionRowComponent implements OnInit, ControlValueAccessor {
	@Input() formControl: FormControl;
	@Input() valueToString = (it => it);
	@Input() value;

	@ViewChild("checkBox", { static: true }) checkBox: MatCheckbox;

	public onChange;
	@Output() selectOnlyThisOption: EventEmitter<any> = new EventEmitter<any>();

	constructor() {
	}

	ngOnInit() {
	}

	@HostListener("click", ["$event"])
	onClick() {
		this.checkBox.toggle();
		this.onChange(!this.formControl.value);
	}

	registerOnChange(fn: any): void {
		this.onChange = fn;
	}

	registerOnTouched(fn: any): void {
		//nothing, we don't care about the touched events
	}

	setDisabledState(isDisabled: boolean): void {
		if (isDisabled) {
			this.formControl.disable();
		} else {
			this.formControl.enable();
		}
	}

	writeValue(obj: boolean): void {
		// this.formControl.setValue(obj);
	}
}
