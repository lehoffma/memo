import {Params} from "@angular/router";
import {combineFilterParams, FilterOption, FilterOptionType} from "./filter-option";
import {AbstractControl, FormBuilder, FormGroup} from "@angular/forms";
import {Observable, of} from "rxjs";
import {flatMap} from "../../../util/util";


export class SingleFilterOption implements FilterOption<FilterOptionType.SINGLE> {
	public type: FilterOptionType.SINGLE = FilterOptionType.SINGLE;
	public static readonly ALL_OPTION = "Alle";

	constructor(
		public key: string,
		public title: string,
		public values: { key: string, label: string, query: { key: string; value: number | string; }[] }[]
	) {

	}

	toFormValue(params: Params): string {
		const selectedOption = this.values.find(option => option.query.length > 0 && option.query.every(query =>
			params[query.key] && (params[query.key] as string).split(",").includes("" + query.value)
		));
		if (!selectedOption) {
			return SingleFilterOption.ALL_OPTION;
		}

		return selectedOption.key;
	}

	toQueryParams(key: string): Params {
		if (key === SingleFilterOption.ALL_OPTION) {
			return flatMap(val => val.query, this.values)
				.reduce((acc, query) => {
					acc[query.key] = null;
					return acc;
				}, {});
		}

		const selectedOption = this.values.find(it => it.key === key);
		if (!selectedOption) {
			console.warn("Could not find key " + key);
			return {};
		}

		return selectedOption.query.reduce((queryAcc, query) =>
				combineFilterParams(queryAcc, {[query.key]: query.value}),
			{});
	}

	isShown(): boolean {
		return this.values.length > 0;
	}


	addControl(value: string, formGroup: FormGroup, formBuilder: FormBuilder): Observable<any> {
		formGroup.addControl(this.key, formBuilder.control(value));
		return of(true);
	}

	canBeReset(formValue: string): boolean {
		return formValue !== SingleFilterOption.ALL_OPTION;
	}

	reset(formControl: AbstractControl) {
		formControl.setValue(SingleFilterOption.ALL_OPTION);
	}

	setFormValue(value: string, formControl: AbstractControl): Observable<any> {
		formControl.setValue(value);
		return of(true);
	}

}
