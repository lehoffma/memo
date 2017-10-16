import {FilterOptionFactoryService} from "./filter-option-factory.service";
import {FilterOptionType} from "./filter-option-type";
import {MultiLevelSelectParent} from "../../shared/multi-level-select/shared/multi-level-select-parent";
import {Observable} from "rxjs/Observable";
import {Injectable} from "@angular/core";

@Injectable()
export class FilterOptionBuilder {
	options: {
		option: (input: any[]) => Observable<MultiLevelSelectParent[]>;
		type: FilterOptionType;
	}[] = [];

	constructor(private filterOptionFactory: FilterOptionFactoryService) {

	}

	empty(): this {
		this.options = [];
		return this;
	}

	withOption(type: FilterOptionType): this {
		if (!this.options.find(it => it.type === type)) {
			this.options.push({
				option: this.filterOptionFactory.get(type),
				type
			});
		}
		return this;
	}

	withOptions(...types: FilterOptionType[]): this {
		return types.reduce((acc, type) => this.withOption(type), this);
	}

	build(results: any[]): Observable<MultiLevelSelectParent[]> {
		const sortedOptions: Observable<MultiLevelSelectParent[]>[] = this.options
			.sort((optionA, optionB) => optionA.type - optionB.type)
			.map(option => option.option(results));


		return Observable.merge(...sortedOptions)
			.scan((options: MultiLevelSelectParent[], value: MultiLevelSelectParent[]) => {
				options.push(...value);
				return options;
			}, []);
	}
}
