import {FilterOptionFactoryService} from "./filter-option-factory.service";
import {SearchResultsFilterOption} from "./search-results-filter-option";
import {MultiLevelSelectParent} from "../utility/multi-level-select/shared/multi-level-select-parent";
import {Injectable} from "@angular/core";
import {merge, Observable} from "rxjs";
import {filter, scan} from "rxjs/operators";
import {Filter} from "../model/api/filter";
import {FilterOption} from "./filter-options/filter-option";

@Injectable()
export class FilterOptionBuilder {
	options: {
		option: (input: Filter) => Observable<FilterOption>;
		type: SearchResultsFilterOption;
	}[] = [];

	constructor(private filterOptionFactory: FilterOptionFactoryService) {

	}

	empty(): this {
		this.options = [];
		return this;
	}

	withOption(type: SearchResultsFilterOption): FilterOptionBuilder {
		if (!this.options.find(it => it.type === type)) {
			this.options.push({
				option: this.filterOptionFactory.get(type),
				type
			});
		}
		return this;
	}

	withOptions(...types: SearchResultsFilterOption[]): FilterOptionBuilder {
		return types.reduce((acc: FilterOptionBuilder, type: SearchResultsFilterOption) => this.withOption(type), this);
	}

	build(filterRequest: Filter): Observable<FilterOption[]> {
		const sortedOptions: Observable<FilterOption>[] = this.options
			.sort((optionA, optionB) => optionA.type - optionB.type)
			.map(option => option.option(filterRequest));


		const done = new Array(sortedOptions.length).map(() => false);
		return merge(...sortedOptions).pipe(
			scan((options: FilterOption[], value: FilterOption, idx) => {
				options.push(value);
				done[idx] = true;
				return options;
			}, []),
			filter(options => done.filter(it => it).length === sortedOptions.length)
		)
	}
}
