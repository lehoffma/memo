import {Injectable} from "@angular/core";
import {MultiLevelSelectParent} from "../../shared/multi-level-select/shared/multi-level-select-parent";
import {EventUtilityService} from "../../shared/services/event-utility.service";
import {ShopItem} from "../../shared/model/shop-item";
import {Event} from "../shared/model/event";
import {Merchandise} from "../shared/model/merchandise";
import {MultiLevelSelectLeaf} from "../../shared/multi-level-select/shared/multi-level-select-leaf";
import * as moment from "moment";
import {StockService} from "../../shared/services/api/stock.service";
import {Observable} from "rxjs/Observable";
import {isObservable} from "../../util/util";
import {MerchColor} from "../shared/model/merch-color";
import {MerchStockList} from "../shared/model/merch-stock";

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
				let selectedMaterials = filterValue.split("|");
				return selectedMaterials.includes(item.material);
			}
			return false;
		}
	};

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
						name: "Alle",
						queryValue: "",
						selected: true
					},
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
						name: "Alle",
						queryValue: "",
						selected: true
					},
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
			.map((nestedStockList: MerchStockList[]) => nestedStockList
				.map(stockList => stockList.map(stockItem => stockItem.color))
				.reduce((acc: MerchColor[], colors: MerchColor[]) =>
						[...acc, ...colors.filter(color => !acc.find(it => it.name === color.name))],
					[])
				//remove duplicates
				.filter((color, index, array) => array.findIndex(_color => _color.name === color.name) === index)
				.map((color: MerchColor) => ({
					name: color.name,
					queryValue: color.name,
					selected: false
				})))
			.defaultIfEmpty([])
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

}
