import {ShopItem} from "../../model/shop-item";
import {Params} from "@angular/router";
import {Observable} from "rxjs";

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
		? { key: string, label: string, query: { key: string; value: number |string; }[] }[]
		: undefined;
	isShown(): boolean;
	toFormValue(params: Params):
		Type extends "single" ? string :
			Type extends "multiple" ? { [key: string]: boolean } :
				Type extends "date-range" ? { from: Date, to: Date } :
					Type extends "shop-item" ? Observable<ShopItem[]> :
						never;
	toQueryParams(value:
						Type extends "single" ? string :
							Type extends "multiple" ? string[] :
								Type extends "date-range" ? { from: Date, to: Date } :
									Type extends "shop-item" ? ShopItem[] :
										never) : Params;
}



export function combineFilterParams(...paramsList: Params[]): Params {
	return paramsList.reduce((combined, params) => {
		return Object.keys(params).reduce((acc, key) => {
			if (acc[key]) {
				acc[key] += "," + params[key];
			} else {
				acc[key] = params[key];
			}
			return acc;
		}, combined);
	}, {});
}
