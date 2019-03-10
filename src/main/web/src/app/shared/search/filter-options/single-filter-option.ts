import {Params} from "@angular/router";
import {combineFilterParams, FilterOption, FilterOptionType} from "./filter-option";


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
			return {};
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

}
