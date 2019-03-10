import {FilterOption, FilterOptionType} from "./filter-option";
import {Params} from "@angular/router";
import {ShopItem} from "../../model/shop-item";
import {combineLatest, Observable, of} from "rxjs";

export class ShopItemFilterOption implements FilterOption<FilterOptionType.SHOP_ITEM> {
	public type: FilterOptionType.SHOP_ITEM = FilterOptionType.SHOP_ITEM;
	values: undefined;

	constructor(
		public key: string,
		public title: string,
		public getItem: (id: number) => Observable<ShopItem>,
		private queryKey = key
	) {

	}

	toFormValue(params: Params): Observable<ShopItem[]> {
		if (!params[this.queryKey]) {
			return of([]);
		}

		return combineLatest(
			...(params[this.queryKey] as string).split(",")
				.map(it => this.getItem(+it))
		)
	}

	toQueryParams(value: ShopItem[]): Params {
		return {
			[this.queryKey]: value.map(it => it.id).join(",")
		}
	}

	isShown(): boolean {
		return true;
	}
}
