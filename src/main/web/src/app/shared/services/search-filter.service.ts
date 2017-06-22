import {Injectable} from "@angular/core";
import {MultiLevelSelectParent} from "../multi-level-select/shared/multi-level-select-parent";
import {EventUtilityService} from "./event-utility.service";
import {ShopItem} from "../model/shop-item";
import {Event} from "../../shop/shared/model/event";

@Injectable()
export class SearchFilterService {

	constructor() {
	}


	//todo abhängig von search results machen
	//kategorie: je nachdem welche search results. d.h. wenn nur merches bei den results dabei sind, sind fahrten und partys
	//			 gar keine auswahlmöglichkeit
	//preis: je nachdem welche search results. da müsste man sich vernünftige preis schritte überlegen
	//farbe: siehe oben
	//					vvvv todo implement vvvv
	//date: letztes Jahr, letzter Monat, letzte Woche, heute, diese Woche, dieser Monat, dieses Jahr?
	//		vielleicht lieber date range picker? :/
	//
	readonly eventFilterOptions: MultiLevelSelectParent[] = [
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
				//	todo: add entries + user to search filters?
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
			name: "Farbe",
			queryKey: "color",
			selectType: "multiple",
			expanded: false,
			children: [
				{
					name: "Weiss",
					queryValue: "Weiss",
					selected: false
				},
				{
					name: "Blau",
					queryValue: "Blau",
					selected: false
				},
				{
					name: "Grün",
					queryValue: "Grün",
					selected: false
				}
			]
		},
	];


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
		"color": (item, filterValue: string) => {
			if (EventUtilityService.isMerchandise(item)) {
				let selectedColors = filterValue.split("|");
				//todo lieber hex nehmen?
				return item.colors.some(color => selectedColors.includes(color.name));
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
	satisfiesFilters(event: Event, filteredBy:any){
		return Object.keys(filteredBy)
				.filter(filterKey => this.eventFilterFunctions[filterKey] !== undefined)
				.filter(filterKey => filteredBy[filterKey] !== undefined)
				.every(filterKey => this.eventFilterFunctions[filterKey](event, filteredBy[filterKey]));
	}

}
