import {FilterOption, FilterOptionType} from "./filter-option";
import {Params} from "@angular/router";

export class DateRangeFilterOption implements FilterOption<FilterOptionType.DATE_RANGE> {
	public type: FilterOptionType.DATE_RANGE = FilterOptionType.DATE_RANGE;
	values: undefined;

	constructor(
		public key: string,
		public title: string,
		private minDateKey = "minDate",
		private maxDateKey = "maxDate"
	) {

	}

	toFormValue(params: Params): { from: Date, to: Date } {
		return undefined;
	}

	toQueryParams(value: { from: Date, to: Date }): Params {
		return {
			[this.minDateKey]: value.from,
			[this.maxDateKey]: value.to
		}
	}

	isShown(): boolean {
		return true;
	}
}
