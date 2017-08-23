import {Injectable} from "@angular/core";
import {MultiLevelSelectParent} from "../multi-level-select/shared/multi-level-select-parent";
import {EventUtilityService} from "./event-utility.service";
import {ShopItem} from "../model/shop-item";
import {Event} from "../../shop/shared/model/event";
import {Merchandise} from "../../shop/shared/model/merchandise";
import {MultiLevelSelectLeaf} from "../multi-level-select/shared/multi-level-select-leaf";
import * as moment from "moment";
import {StockService} from "./stock.service";
import {Observable} from "rxjs/Observable";

@Injectable()
export class SearchFilterService {

	constructor(private stockService: StockService) {
	}


	/**
	 * todo date: date range picker?
	 * @param {Event[]} results
	 */
	async getEventFilterOptionsFromResults(results: Event[]) {
		let eventFilterOptions: MultiLevelSelectParent[] = [
			{
				name: "Kategorie",
				queryKey: "category",
				selectType: "multiple",
				expanded: false,
				children: [
					{
						name: "Fahrten",
						queryValue: "tours",
						selected: false
					},
					{
						name: "Veranstaltungen",
						queryValue: "partys",
						selected: false
					},
					{
						name: "Merchandise",
						queryValue: "merch",
						selected: false
					}
				]
			},
			{
				name: "Preis",
				queryKey: "price",
				expanded: false,
				selectType: "single",
				children: [
					{
						name: "Unter 10 Euro",
						queryValue: "below10",
						selected: false
					},
					{
						name: "10 bis 50 Euro",
						queryValue: "between10and50",
						selected: false
					},
					{
						name: "50 bis 100 Euro",
						queryValue: "between50and100",
						selected: false
					},
					{
						name: "Über 100 Euro",
						queryValue: "moreThan100",
						selected: false
					}
				]
			},
			{
				name: "Datum",
				selectType: "single",
				expanded: false,
				queryKey: "date",
				children: [
					{
						name: "Vergangene Events",
						queryValue: "past",
						selected: false
					},
					{
						name: "Zukünftige Events",
						queryValue: "upcoming",
						selected: false
					}
				]
			}
		];

		//colors aus dem stock raus holen
		let colorChildren: MultiLevelSelectLeaf[] = await Observable.combineLatest(...results
			.filter(event => EventUtilityService.isMerchandise(event))
			.map(event => (<Merchandise>event))
			.map(merch => this.stockService.getByEventId(merch.id))
		)
			.map(nestedStockList => nestedStockList
				.map(stockList => stockList.map(stockItem => stockItem.color))
				.reduce((acc, colors) => [...acc, ...colors.filter(color => !acc.find(it => it.name === color.name))],
					[])
				.map(color => ({
					name: color.name,
					queryValue: color.name,
					selected: false
				})))
			.toPromise();

		eventFilterOptions.push({
			name: "Farben",
			queryKey: "color",
			selectType: "multiple",
			expanded: false,
			children: colorChildren
		});

		let materialChildren: MultiLevelSelectLeaf[] = results
			.filter(event => EventUtilityService.isMerchandise(event))
			.map(event => (<Merchandise>event))
			.map(merch => merch.material)
			.filter((material, index, array) => array.indexOf(material) === index)
			.map(material => ({
				name: material,
				queryValue: material,
				selected: false
			}));

		eventFilterOptions.push({
			name: "Material",
			queryKey: "material",
			selectType: "multiple",
			expanded: false,
			children: materialChildren
		});

		return eventFilterOptions;
	}

	readonly eventFilterFunctions: {
		[key: string]: (obj: ShopItem | Event, filterValue: any) => boolean
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
				let selectedColors = filterValue.split("|");
				//todo lieber hex nehmen?
				return item.colors.some(color => selectedColors.includes(color.name));
			}
			return false;
		},
		"material": (item, filterValue: string) => {
			if (EventUtilityService.isMerchandise(item)) {
				let selectedMaterials = filterValue.split("|");
				return selectedMaterials.includes(item.material);
			}
			return false;
		}
	};

	/**
	 *
	 * @param event
	 * @param filteredBy
	 * @returns {boolean}
	 */
	satisfiesFilters(event: Event, filteredBy: any) {
		return Object.keys(filteredBy)
			.filter(filterKey => this.eventFilterFunctions[filterKey] !== undefined)
			.filter(filterKey => filteredBy[filterKey] !== undefined)
			.every(filterKey => this.eventFilterFunctions[filterKey](event, filteredBy[filterKey]));
	}

}
