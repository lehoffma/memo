import {Injectable} from '@angular/core';
import {FilterOptionType} from "./filter-option-type";
import {MultiLevelSelectParent} from "../../shared/multi-level-select/shared/multi-level-select-parent";
import {Observable} from "rxjs/Rx";
import {Event} from "../shared/model/event";
import {MerchStockList} from "../shared/model/merch-stock";
import {Merchandise} from "../shared/model/merchandise";
import {EventUtilityService} from "../../shared/services/event-utility.service";
import {attributeSortingFunction, sortingFunction} from "../../util/util";
import {MerchColor} from "../shared/model/merch-color";
import {StockService} from "../../shared/services/api/stock.service";

@Injectable()
export class FilterOptionFactoryService {

	constructor(private stockService: StockService) {
	}

	readonly getCategory = () => Observable.of([{
		name: "Kategorie",
		queryKey: "category",
		selectType: (<"multiple" | "single">"multiple"),
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
	}]);

	readonly getPrice = () => Observable.of([{
		name: "Preis",
		queryKey: "price",
		expanded: false,
		selectType: (<"multiple" | "single">"single"),
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
	}]);

	readonly getDate = () => Observable.of([{
		name: "Datum",
		selectType: (<"multiple" | "single">"single"),
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
	}]);

	private getSizeFilterOptions(results: Event[]): Observable<MultiLevelSelectParent[]> {
		return Observable.combineLatest(...results
			.filter(event => EventUtilityService.isMerchandise(event))
			.map(event => (<Merchandise>event))
			.map(merch => this.stockService.getByEventId(merch.id))
		)
			.map((nestedStockList: MerchStockList[]) => nestedStockList
				.map(stockList => stockList.map(stockItem => stockItem.size))
				.reduce((acc: string[], sizes: string[]) =>
						[...acc, ...sizes.filter(size => !acc.find(it => it === size))],
					[])
				//remove duplicates
				.filter((size, index, array) => array.indexOf(size) === index)
				.map((size: string) => ({
					name: size,
					queryValue: size,
					selected: false
				})))
			.defaultIfEmpty([])
			.map(sizes => [{
				name: "Größe",
				queryKey: "size",
				selectType: (<"multiple" | "single">"multiple"),
				expanded: false,
				children: sizes
			}]);
	}


	private getMaterialFilterOptions(results: Event[]): Observable<MultiLevelSelectParent[]> {
		return Observable.of(results
			.filter(event => EventUtilityService.isMerchandise(event))
			.map(event => (<Merchandise>event))
			.map(merch => merch.material)
			.filter((material, index, array) => array.indexOf(material) === index)
			.sort(sortingFunction(obj => obj, false))
			.map(material => ({
				name: material,
				queryValue: material,
				selected: false
			})))
			.map(materials => [{
				name: "Material",
				queryKey: "material",
				selectType: (<"multiple" | "single">"multiple"),
				expanded: false,
				children: materials
			}])
	}

	private getColorFilterOptions(results: Event[]): Observable<MultiLevelSelectParent[]> {
		return Observable.combineLatest(...results
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
				.sort(attributeSortingFunction("name", false))
				.map((color: MerchColor) => ({
					name: color.name,
					queryValue: color.name,
					selected: false
				})))
			.defaultIfEmpty([])
			.map(colors => [{
				name: "Farben", queryKey: "color",
				selectType: (<"multiple" | "single">"multiple"),
				expanded: false, children: colors
			}])
	}

	get(type: FilterOptionType): (results:any[]) => Observable<MultiLevelSelectParent[]> {
		switch (type) {
			case FilterOptionType.EVENT_CATEGORY:
				return this.getCategory;
			case FilterOptionType.PRICE:
				return this.getPrice;
			case FilterOptionType.DATE:
				return this.getDate;

			case FilterOptionType.COLOR:
				return this.getColorFilterOptions.bind(this);

			case FilterOptionType.MATERIAL:
				return this.getMaterialFilterOptions;

			case FilterOptionType.SIZE:
				return this.getSizeFilterOptions.bind(this);
		}

		return () => Observable.throw(new Error("No provider for type " + type));
	}
}
