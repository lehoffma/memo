import {FilterOption, FilterOptionType} from "./filter-option";
import {Params} from "@angular/router";
import {parse} from "date-fns";

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
		const value: { from: Date, to: Date } = {from: null, to: null};
		if (params[this.minDateKey]) {
			value.from = parse(params[this.minDateKey]);
		}
		if (params[this.maxDateKey]) {
			value.to = parse(params[this.maxDateKey]);
		}

		return value;
	}

	toQueryParams(value: { from: Date, to: Date }): Params {
		let params: Params = {};

		if (value.from) {
			params[this.minDateKey] = value.from.toISOString();
		}
		if (value.to) {
			params[this.maxDateKey] = value.to.toISOString();
		}

		return params;
	}

	isShown(): boolean {
		return true;
	}
}
