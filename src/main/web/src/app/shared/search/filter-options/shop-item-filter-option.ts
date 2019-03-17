import {FilterOption, FilterOptionType} from "./filter-option";
import {Params} from "@angular/router";
import {ShopItem} from "../../model/shop-item";
import {combineLatest, Observable, of} from "rxjs";
import {map, tap} from "rxjs/operators";
import {AbstractControl, FormBuilder, FormGroup} from "@angular/forms";

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

	toFormValue(params: Params): Observable<{ items: ShopItem[], input: string }> {
		if (!params[this.queryKey]) {
			return of({items: [], input: ""});
		}

		return combineLatest(
			...(params[this.queryKey] as string).split(",")
				.map(it => this.getItem(+it))
		).pipe(
			map(items => ({items, input: ""}))
		)
	}

	toQueryParams(value: ShopItem[]): Params {
		return {
			[this.queryKey]: value.length === 0 ? null : value.map(it => it.id).join(",")
		}
	}

	isShown(): boolean {
		return true;
	}


	addControl(value: Observable<{ items: ShopItem[], input: string }>, formGroup: FormGroup, formBuilder: FormBuilder): Observable<any> {
		formGroup.addControl(this.key, formBuilder.group({
			items: formBuilder.control([]),
			input: formBuilder.control("")
		}));
		return value.pipe(
			tap(it => {
				formGroup.get(this.key).get("items").setValue(it.items);
				formGroup.get(this.key).get("input").setValue(it.input);
			})
		);
	}

	canBeReset(formValue: { items: ShopItem[], input: string }): boolean {
		return formValue && formValue.items.length > 0;
	}

	reset(formControl: AbstractControl) {
		formControl.setValue({
			items: [],
			input: "",
		}, {emitEvent: true});
	}

	setFormValue(value: Observable<{ items: ShopItem[], input: string }>, formControl: AbstractControl): Observable<any> {
		return value.pipe(
			tap(it => formControl.setValue(it))
		)
	}

}
