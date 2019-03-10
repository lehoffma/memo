import {combineFilterParams, FilterOption, FilterOptionType} from "./filter-option";
import {Params} from "@angular/router";

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
				if(!paramValue){
					return false;
				}
				return paramValue.split(",").includes("" + query.value);
			});

			return acc;
		}, {});
	}

	toQueryParams(selectedKeys: string[]): Params {
		const selectedOptions = this.values.filter(option => selectedKeys.includes(option.key));

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


}
