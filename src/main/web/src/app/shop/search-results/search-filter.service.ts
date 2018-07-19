import {Injectable} from "@angular/core";
import {MultiLevelSelectParent} from "../../shared/utility/multi-level-select/shared/multi-level-select-parent";
import {EventUtilityService} from "../../shared/services/event-utility.service";
import {ShopItem} from "../../shared/model/shop-item";
import {Event} from "../shared/model/event";
import {StockService} from "../../shared/services/api/stock.service";
import {isObservable} from "../../util/util";
import {isNullOrUndefined} from "util";
import {ActivatedRoute, ParamMap} from "@angular/router";
import {isMultiLevelSelectLeaf} from "../../shared/utility/multi-level-select/shared/multi-level-select-option";
import {combineLatest, Observable, of} from "rxjs";
import {defaultIfEmpty, first, map} from "rxjs/operators";
import {isAfter, isBefore, isEqual, startOfDay} from "date-fns";
import {MultiLevelSelectLeaf} from "../../shared/utility/multi-level-select/shared/multi-level-select-leaf";

@Injectable()
export class SearchFilterService {


	//todo pagination remove
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
						return isBefore(item.date, startOfDay(new Date()));
					case "upcoming":
						return isEqual(item.date, new Date()) || isAfter(item.date, new Date());
				}
			}
			return true;
		},
		"color": (item, filterValue: string) => {
			if (EventUtilityService.isMerchandise(item)) {
				const selectedColors = filterValue.split("|");
				return this.stockService.getByEventId(item.id)
					.pipe(
						map(stockList => stockList.map(stockItem => stockItem.color.name)),
						map(colorNames => colorNames.some(color => selectedColors.includes(color)))
					);
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
					.pipe(
						map(stockList => stockList.map(stockItem => stockItem.size)),
						map(sizes => sizes.some(size => selectedSizes.includes(size)))
					);
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
				return of(result);
			})];

		return combineLatest(...filterResults)
			.pipe(
				map((results: boolean[]) => results.every(value => value)),
				defaultIfEmpty(true)
			);
	}


	/**
	 * Schaut, ob die Route query parameter beinhaltet und initialisiert die filter menü checkboxen mit den
	 * jeweiligen werten
	 */
	initFilterMenu(activatedRoute: ActivatedRoute, filterOptions: MultiLevelSelectParent[]): Observable<MultiLevelSelectParent[]> {
		//checks if the route includes query parameters and initializes the filter-menu's checkboxes
		return activatedRoute.queryParamMap
			.pipe(
				first(),
				map((queryParamMap: ParamMap) => {
					return [...filterOptions].map((filterOptionParent: MultiLevelSelectParent) => {
						filterOptionParent.children
							.filter(child => isMultiLevelSelectLeaf(child))
							.map(it => <MultiLevelSelectLeaf>it)
							.forEach(child => child.selected = false);

						const matchingOptions = filterOptionParent.children
							.filter(child => isMultiLevelSelectLeaf(child))
							.map(it => <MultiLevelSelectLeaf>it)
							.filter((child: MultiLevelSelectLeaf) =>
								child.query.every(query => queryParamMap.has(query.key))
							)
							.filter((child: MultiLevelSelectLeaf) => {
								if (!child.query || child.query.length === 0) {
									return false;
								}
								return child.query.every(query => {
									//combine something like 'key=tours|partys&key=partys' to one array
									let paramValues: string[] = queryParamMap.getAll(query.key)
										.join("|")
										.split("|");
									const queryValues = query.values;
									if (queryValues) {
										return queryValues.every(value => paramValues.includes(value))
									}
									return false;
								})
							});

						matchingOptions
							.forEach((child: MultiLevelSelectLeaf) => {
								child.selected = true;
							});

						if (matchingOptions.length === 0 && filterOptionParent.selectType === "single") {
							filterOptionParent.children
								.filter(it => it.name === "Alle")
								.filter(child => isMultiLevelSelectLeaf(child))
								.map(it => <MultiLevelSelectLeaf>it)
								.forEach(child => child.selected = true);
						}

						return filterOptionParent;
					});
				})
			);
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
			if (options.findIndex(option => option.name === acc[i].name) === -1) {
				acc.splice(i, 1);
			}
		}

		//modify children values
		options
			.filter(option => !!acc.find(prevOption => prevOption.name === option.name))
			.forEach((option: MultiLevelSelectParent) => {
				const index = acc.findIndex(prevOption => prevOption.name === option.name);

				//add children if array is null/undefined
				if (isNullOrUndefined(acc[index].children) && option.children) {
					acc[index].children = [...option.children];
				}
				else if (acc[index].children && option.children) {
					//remove children that are not part of the array anymore
					//and modify children that just changed their selected status
					for (let i = acc[index].children.length - 1; i >= 0; i--) {
						const childIndex = option.children.findIndex(child => child.name === acc[index].children[i].name);
						if (childIndex === -1) {
							acc[index].children.splice(i, 1);
						}
						else {
							(acc[index].children[i] as MultiLevelSelectLeaf).selected =
								(option.children[childIndex] as MultiLevelSelectLeaf).selected;
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
				!acc.find(prevOption => prevOption.name === option.name)
			)
		);

		return acc;
	}
}
