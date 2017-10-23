import {Injectable} from "@angular/core";
import {MultiLevelSelectParent} from "../../shared/multi-level-select/shared/multi-level-select-parent";
import {EventUtilityService} from "../../shared/services/event-utility.service";
import {ShopItem} from "../../shared/model/shop-item";
import {Event} from "../shared/model/event";
import * as moment from "moment";
import {StockService} from "../../shared/services/api/stock.service";
import {Observable} from "rxjs/Rx";
import {isObservable} from "../../util/util";
import {isNullOrUndefined} from "util";
import {ActivatedRoute} from "@angular/router";
import {isMultiLevelSelectLeaf} from "../../shared/multi-level-select/shared/multi-level-select-option";

@Injectable()
export class SearchFilterService {

	readonly eventFilterFunctions: {
		[key: string]: (obj: ShopItem | Event, filterValue: any) => boolean | Observable<boolean>
	} = {
		"category": (item, filterValue: string) => {
			if (EventUtilityService.isMerchandise(item) || EventUtilityService.isTour(item) || EventUtilityService.isParty(item)) {
				const values = filterValue.split("|");
				return values.includes(EventUtilityService.getEventType(item).toString());
			}
			return true;
		},
		"price": (item, filterValue: string) => {
			const belowRegex = /below([\d]+)/;
			const rangeRegex = /between([\d]+)and([\d]+)/;
			const moreThanRegex = /moreThan([\d]+)/;
			const price: number = (<Event>item).price;

			if (price) {
				if (belowRegex.test(filterValue)) {
					const result = belowRegex.exec(filterValue);
					return price < +result[1];
				}
				else if (rangeRegex.test(filterValue)) {
					const result = rangeRegex.exec(filterValue);
					return price >= +result[1] && price <= +result[2];
				}
				else if (moreThanRegex.test(filterValue)) {
					const result = moreThanRegex.exec(filterValue);
					return price > +result[1];
				}
			}
			return true;
		},
		"date": (item, filterValue: string) => {
			if (EventUtilityService.isParty(item) || EventUtilityService.isTour(item)) {
				switch (filterValue) {
					case "past":
						return moment().startOf("day").isAfter(moment(item.date));
					case "upcoming":
						return moment().startOf("day").isSameOrBefore(moment(item.date));
				}
			}
			return false;
		},
		"color": (item, filterValue: string) => {
			if (EventUtilityService.isMerchandise(item)) {
				const selectedColors = filterValue.split("|");
				return this.stockService.getByEventId(item.id)
					.map(stockList => stockList.map(stockItem => stockItem.color.name))
					.map(colorNames => colorNames.some(color => selectedColors.includes(color)));
			}
			return false;
		},
		"material": (item, filterValue: string) => {
			if (EventUtilityService.isMerchandise(item)) {
				const selectedMaterials = filterValue.split("|");
				return selectedMaterials.includes(item.material);
			}
			return false;
		},
		"size": (item, filterValue: string) => {
			if (EventUtilityService.isMerchandise(item)) {
				const selectedSizes = filterValue.split("|");
				return this.stockService.getByEventId(item.id)
					.map(stockList => stockList.map(stockItem => stockItem.size))
					.map(sizes => sizes.some(size => selectedSizes.includes(size)));
			}
			return false;
		}
	};

	constructor(private stockService: StockService) {
	}

	/**
	 *
	 * @param event
	 * @param filteredBy
	 * @returns {boolean}
	 */
	satisfiesFilters(event: Event, filteredBy: any): Observable<boolean> {
		const filterKeys = Object.keys(filteredBy)
			.filter(filterKey => this.eventFilterFunctions[filterKey] !== undefined)
			.filter(filterKey => filteredBy[filterKey] !== undefined);

		const filterResults: Observable<boolean>[] = [...filterKeys
			.map(filterKey => this.eventFilterFunctions[filterKey](event, filteredBy[filterKey]))
			.map(result => {
				if (isObservable(result)) {
					return result;
				}
				return Observable.of(result);
			})];

		return Observable.combineLatest(...filterResults)
			.map((results: boolean[]) => results.every(value => value))
			.defaultIfEmpty(true);
	}


	/**
	 * Schaut, ob die Route query parameter beinhaltet und initialisiert die filter menü checkboxen mit den
	 * jeweiligen werten
	 */
	initFilterMenu(activatedRoute: ActivatedRoute, filterOptions: MultiLevelSelectParent[]): Observable<MultiLevelSelectParent[]> {
		//checks if the route includes query parameters and initializes the filtermenus checkboxes
		return activatedRoute.queryParamMap
			.first()
			.map(queryParamMap => {
				return [...filterOptions].map(filterOptionParent => {
					let key = filterOptionParent.queryKey;
					//if the key associated with the filter selection box is part of the query parameters,
					//update the filterOption's selected values.
					if (queryParamMap.has(key)) {
						let values: string[] = queryParamMap.get(key).split("|"); //something like 'tours|partys|merch'
						filterOptionParent.children.forEach(child => {
							if (isMultiLevelSelectLeaf(child)) {
								child.selected = values.includes(child.queryValue);
							}
						});
					}
					return filterOptionParent;
				});
			});
	}


	/**
	 *
	 * @param {MultiLevelSelectParent[]} acc
	 * @param {MultiLevelSelectParent[]} options
	 * @returns {MultiLevelSelectParent[]}
	 */
	mergeFilterOptions(acc: MultiLevelSelectParent[], options: MultiLevelSelectParent[]) {

		if (!acc || options.length === 0) {
			return options;
		}
		//remove values that are not part of the array anymore
		for (let i = acc.length - 1; i >= 0; i--) {
			if (options.findIndex(option => option.queryKey === acc[i].queryKey) === -1) {
				acc.splice(i, 1);
			}
		}

		//modify children values (todo make more generic, only supports parent->child structures)
		options
			.filter(option => !!acc.find(prevOption => prevOption.queryKey === option.queryKey))
			.forEach(option => {
				const index = acc.findIndex(prevOption => prevOption.queryKey === option.queryKey);

				//add children if array is null/undefined
				if (isNullOrUndefined(acc[index].children) && option.children) {
					acc[index].children = [...option.children];
				}
				else if (acc[index].children && option.children) {
					//remove children that are not part of the array anymore
					for (let i = acc[index].children.length - 1; i >= 0; i--) {
						if (option.children.findIndex(child => child.name === acc[index].children[i].name) === -1) {
							acc[index].children.splice(i, 1);
						}
					}
					//add children that aren't yet part of the array
					acc[index].children.push(
						...option.children.filter(child =>
							!acc[index].children.find(childOption => childOption.name === child.name)
						)
					);
				}
			});

		//add options that aren't yet part of the array to the array
		acc.push(
			...options.filter(option =>
				!acc.find(prevOption => prevOption.queryKey === option.queryKey)
			)
		);

		return acc;
	}
}
