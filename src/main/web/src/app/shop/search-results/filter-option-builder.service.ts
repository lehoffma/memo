import {FilterOptionFactoryService} from "./filter-option-factory.service";
import {FilterOptionType} from "./filter-option-type";
import {MultiLevelSelectParent} from "../../shared/utility/multi-level-select/shared/multi-level-select-parent";
import {Injectable} from "@angular/core";
import {merge, Observable} from "rxjs";
import {scan} from "rxjs/operators";
import {Filter} from "../../shared/model/api/filter";

@Injectable()
export class FilterOptionBuilder {
	options: {
		option: (input: Filter) => Observable<MultiLevelSelectParent[]>;
		type: FilterOptionType;
	}[] = [];

	constructor(private filterOptionFactory: FilterOptionFactoryService) {

	}

	empty(): this {
		this.options = [];
		return this;
	}

	withOption(type: FilterOptionType): FilterOptionBuilder {
		if (!this.options.find(it => it.type === type)) {
			this.options.push({
				option: this.filterOptionFactory.get(type),
				type
			});
		}
		return this;
	}

	withOptions(...types: FilterOptionType[]): FilterOptionBuilder {
		return types.reduce((acc: FilterOptionBuilder, type: FilterOptionType) => this.withOption(type), this);
	}

	build(filterRequest: Filter): Observable<MultiLevelSelectParent[]> {
		const sortedOptions: Observable<MultiLevelSelectParent[]>[] = this.options
			.sort((optionA, optionB) => optionA.type - optionB.type)
			.map(option => option.option(filterRequest));


		return merge(...sortedOptions)
			.pipe(
				scan((options: MultiLevelSelectParent[], value: MultiLevelSelectParent[]) => {
					options.push(...value);
					return options;
				}, [])
			);
	}
}
