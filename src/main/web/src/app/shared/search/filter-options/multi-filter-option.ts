import {combineFilterParams, FilterOption, FilterOptionType} from "./filter-option";
import {Params} from "@angular/router";
import {AbstractControl, FormBuilder, FormGroup} from "@angular/forms";
import {Observable, of} from "rxjs";
import {flatMap} from "../../../util/util";

export class MultiFilterOption implements FilterOption<FilterOptionType.MULTIPLE> {
	public type: FilterOptionType.MULTIPLE = FilterOptionType.MULTIPLE;

	constructor(
		public key: string,
		public title: string,
		public values: { key: string, label: string, query: { key: string; value: number | string; }[] }[]
	) {

	}

	toFormValue(params: Params): { [key: string]: boolean } {
		return this.values.reduce((acc, optionValue) => {
			//set to true if all query values are contained in the params object
			acc[optionValue.key] = optionValue.query.every(query => {
				const paramValue = params[query.key] as string;
				if (!paramValue) {
					return false;
				}
				return paramValue.split(",").includes("" + query.value);
			});

			return acc;
		}, {});
	}

	toQueryParams(selectedKeys: string[]): Params {
		const selectedOptions = this.values.filter(option => selectedKeys.includes(option.key));

		if (!selectedKeys || selectedKeys.length === 0) {
			return flatMap(val => val.query, this.values)
				.reduce((acc, query) => {
					acc[query.key] = null;
					return acc;
				}, {});
		}

		return selectedOptions.reduce((params, option) => {
			return combineFilterParams(params, option.query.reduce((queryAcc, query) =>
					combineFilterParams(queryAcc, {[query.key]: query.value}),
				{})
			)
		}, {});
	}

	isShown(): boolean {
		return this.values.length > 0;
	}


	addControl(value: { [key: string]: boolean }, formGroup: FormGroup, formBuilder: FormBuilder): Observable<any> {
		formGroup.addControl(this.key, formBuilder.group(
			Object.keys(value).reduce((acc, key) => {
				acc[key] = formBuilder.control(value[key]);
				return acc;
			}, {})
		));
		return of(true);
	}

	canBeReset(formValue: { [key: string]: boolean }): boolean {
		return Object.keys(formValue).some(key => formValue[key]);
	}

	reset(formControl: AbstractControl) {
		formControl.setValue(Object.keys(formControl.value).reduce((acc, key) => {
			acc[key] = false;
			return acc;
		}, {}), {emitEvent: true});
	}

	setFormValue(value: { [key: string]: boolean }, formControl: AbstractControl): Observable<any> {
		formControl.setValue(value);
		return of(true);
	}


}
