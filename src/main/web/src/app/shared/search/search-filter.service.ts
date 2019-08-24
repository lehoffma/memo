import {Injectable} from "@angular/core";
import {MultiLevelSelectParent} from "../utility/multi-level-select/shared/multi-level-select-parent";
import {EventUtilityService} from "../services/event-utility.service";
import {ShopItem} from "../model/shop-item";
import {Event} from "../../shop/shared/model/event";
import {StockService} from "../services/api/stock.service";
import {isObservable} from "../../util/util";
import {ActivatedRoute} from "@angular/router";
import {isMultiLevelSelectLeaf} from "../utility/multi-level-select/shared/multi-level-select-option";
import {combineLatest, Observable, of} from "rxjs";
import {defaultIfEmpty, map} from "rxjs/operators";
import {isAfter, isBefore, isEqual, startOfDay} from "date-fns";
import {MultiLevelSelectLeaf} from "../utility/multi-level-select/shared/multi-level-select-leaf";
import {getAllQueryValues} from "../model/util/url-util";
import {FilterOption, FilterOptionType} from "./filter-options/filter-option";
import {isNullOrUndefined} from "util";

@Injectable({
	providedIn: "root"
})
export class SearchFilterService {

	constructor(private stockService: StockService) {
	}


	/**
	 *
	 * @param {MultiLevelSelectParent[]} acc
	 * @param {MultiLevelSelectParent[]} options
	 * @returns {MultiLevelSelectParent[]}
	 */
	mergeFilterOptions(acc: FilterOption[], options: FilterOption[]): FilterOption[] {
		if (!acc || options.length === 0) {
			return options;
		}
		//remove values that are not part of the array anymore
		for (let i = acc.length - 1; i >= 0; i--) {
			if (options.findIndex(option => option.key === acc[i].key) === -1) {
				acc.splice(i, 1);
			}
		}

		//modify children values
		options
			.filter(option => option.type === FilterOptionType.SINGLE || option.type === FilterOptionType.MULTIPLE)
			.filter(option => !!acc.find(prevOption => prevOption.key === option.key))
			.forEach((option: FilterOption) => {
				const index = acc.findIndex(prevOption => prevOption.key === option.key);

				//add children if array is null/undefined
				if (isNullOrUndefined(acc[index].values) && option.values) {
					acc[index].values = [...option.values];
				}
				else if (acc[index].values && option.values) {
					//remove children that are not part of the array anymore
					//and modify children that just changed their selected status
					for (let i = acc[index].values.length - 1; i >= 0; i--) {
						const childIndex = option.values.findIndex(child => child.key === acc[index].values[i].key);
						if (childIndex === -1) {
							acc[index].values.splice(i, 1);
						}
					}
					//add children that aren't yet part of the array
					acc[index].values.push(
						...option.values.filter(child =>
							!acc[index].values.find(childOption => childOption.key === child.key)
						)
					);
				}
			});

		//add options that aren't yet part of the array to the array
		acc.push(
			...options.filter(option =>
				!acc.find(prevOption => prevOption.key === option.key)
			)
		);

		return acc;
	}
}
