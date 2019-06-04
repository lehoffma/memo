import {ShopItem} from "../../model/shop-item";
import {Params} from "@angular/router";
import {Observable} from "rxjs";
import {AbstractControl, FormBuilder, FormGroup} from "@angular/forms";

export enum FilterOptionType {
	SINGLE = "single",
	MULTIPLE = "multiple",
	DATE_RANGE = "date-range",
	SHOP_ITEM = "shop-item"
}

export interface FilterOption<Type = FilterOptionType> {
	key: string;
	title: string;
	type: Type;
	values: Type extends "single" | "multiple"
		? { key: string, label: string, query: { key: string; value: number | string; }[] }[]
		: undefined;

	isShown(): boolean;

	reset(formControl: AbstractControl);

	canBeReset(formValue: Type extends "single" ? string :
		Type extends "multiple" ? { [key: string]: boolean } :
			Type extends "date-range" ? { from: Date, to: Date } :
				Type extends "shop-item" ? { items: ShopItem[], input: string } : never): boolean;

	setFormValue(value: Type extends "single" ? string :
		Type extends "multiple" ? { [key: string]: boolean } :
			Type extends "date-range" ? { from: Date, to: Date } :
				Type extends "shop-item" ? Observable<{ items: ShopItem[], input: string }> :
					never, formControl: AbstractControl): Observable<any>;

	addControl(value: Type extends "single" ? string :
		Type extends "multiple" ? { [key: string]: boolean } :
			Type extends "date-range" ? { from: Date, to: Date } :
				Type extends "shop-item" ? Observable<{ items: ShopItem[], input: string }> :
					never, formGroup: FormGroup, formBuilder: FormBuilder): Observable<any>;

	toFormValue(params: Params):
		Type extends "single" ? string :
			Type extends "multiple" ? { [key: string]: boolean } :
				Type extends "date-range" ? { from: Date, to: Date } :
					Type extends "shop-item" ? Observable<{ items: ShopItem[], input: string }> :
						never;

	toQueryParams(value:
					  Type extends "single" ? string :
						  Type extends "multiple" ? string[] :
							  Type extends "date-range" ? { from: Date, to: Date } :
								  Type extends "shop-item" ? ShopItem[] :
									  never): Params;
}


export function combineFilterParams(...paramsList: Params[]): Params {
	return paramsList.reduce((combined, params) => {
		return Object.keys(params).reduce((acc, key) => {
			if (acc[key] !== undefined && acc[key] !== null) {
				acc[key] += "," + params[key];
			} else {
				acc[key] = params[key];
			}
			return acc;
		}, combined);
	}, {});
}
