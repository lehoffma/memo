import {FilterOption, FilterOptionType} from "./filter-option";
import {Params} from "@angular/router";
import {parseISO} from "date-fns";
import {AbstractControl, FormBuilder, FormGroup} from "@angular/forms";
import {Observable, of} from "rxjs";

export class DateRangeFilterOption implements FilterOption<FilterOptionType.DATE_RANGE> {
	public type: FilterOptionType.DATE_RANGE = FilterOptionType.DATE_RANGE;
	values: undefined;

	constructor(
		public key: string,
		public title: string,
		private minDateKey = "min" + key.charAt(0).toUpperCase() + key.slice(1),
		private maxDateKey = "max" + key.charAt(0).toUpperCase() + key.slice(1)
	) {

	}

	toFormValue(params: Params): { from: Date, to: Date } {
		const value: { from: Date, to: Date } = {from: null, to: null};
		if (params[this.minDateKey]) {
			value.from = parseISO(params[this.minDateKey]);
		}
		if (params[this.maxDateKey]) {
			value.to = parseISO(params[this.maxDateKey]);
		}

		return value;
	}

	toQueryParams(value: { from: Date, to: Date }): Params {
		let params: Params = {};

		params[this.minDateKey] = value.from ? value.from.toISOString() : null;
		params[this.maxDateKey] = value.to ? value.to.toISOString() : null;

		return params;
	}

	isShown(): boolean {
		return true;
	}


	addControl(value: { from: Date, to: Date }, formGroup: FormGroup, formBuilder: FormBuilder): Observable<any> {
		formGroup.addControl(this.key, formBuilder.group({
			from: formBuilder.control((value as any).from),
			to: formBuilder.control((value as any).to)
		}));
		return of(true);
	}

	canBeReset(formValue: { from: Date, to: Date }): boolean {
		return !!(formValue.from || formValue.to);
	}

	reset(formControl: AbstractControl) {
		formControl.reset({
			from: null,
			to: null
		}, {emitEvent: true});
	}

	setFormValue(value: { from: Date, to: Date }, formControl: AbstractControl): Observable<any> {
		formControl.setValue(value);
		return of(true);
	}

}
