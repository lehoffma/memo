import {Injectable} from "@angular/core";
import {FilterOptionType} from "./filter-option-type";
import {MultiLevelSelectParent} from "../../shared/utility/multi-level-select/shared/multi-level-select-parent";
import {Event} from "../shared/model/event";
import {MerchStockList} from "../shared/model/merch-stock";
import {Merchandise} from "../shared/model/merchandise";
import {EventUtilityService} from "../../shared/services/event-utility.service";
import {attributeSortingFunction, sortingFunction} from "../../util/util";
import {MerchColor} from "../shared/model/merch-color";
import {StockService} from "../../shared/services/api/stock.service";
import {combineLatest, Observable, of, throwError} from "rxjs";
import {defaultIfEmpty, map, mergeMap} from "rxjs/operators";
import {Sort} from "../../shared/model/api/sort";
import {MultiLevelSelectLeaf} from "../../shared/utility/multi-level-select/shared/multi-level-select-leaf";
import {EventType, typeToInteger} from "../shared/model/event-type";
import {Filter} from "../../shared/model/api/filter";
import {EventService} from "../../shared/services/api/event.service";

@Injectable()
export class FilterOptionFactoryService {

	//todo
	readonly getCategory: () => Observable<MultiLevelSelectParent[]> = () => of([{
		name: "Kategorie",
		selectType: (<"multiple" | "single">"multiple"),
		expanded: false,
		children: [
			FilterOptionFactoryService.byKey("Fahrten", "type", "" + typeToInteger(EventType.tours)),
			FilterOptionFactoryService.byKey("Veranstaltungen", "type", "" + typeToInteger(EventType.partys)),
			FilterOptionFactoryService.byKey("Merchandise", "type", "" + typeToInteger(EventType.merch)),
		]
	}]);
	readonly getPrice: () => Observable<MultiLevelSelectParent[]> = () => of([{
		name: "Preis",
		expanded: false,
		selectType: (<"multiple" | "single">"single"),
		children: [
			{
				query: [],
				name: "Alle",
				selected: true
			},
			FilterOptionFactoryService.max("Unter 10 Euro", "price", 10),
			...FilterOptionFactoryService.combine(
				FilterOptionFactoryService.min("10 bis 50 Euro", "price", 10.01),
				FilterOptionFactoryService.max("10 bis 50 Euro", "price", 50)
			),
			...FilterOptionFactoryService.combine(
				FilterOptionFactoryService.min("50 bis 100 Euro", "price", 50.01),
				FilterOptionFactoryService.max("50 bis 100 Euro", "price", 100)
			),
			FilterOptionFactoryService.min("Über 100 Euro", "price", 100.01)
		]
	}]);
	readonly getDate: () => Observable<MultiLevelSelectParent[]> = () => of([{
		name: "Datum",
		selectType: (<"multiple" | "single">"single"),
		expanded: false,
		children: [
			{
				query: [],
				name: "Alle",
				selected: true
			},
			FilterOptionFactoryService.byKey("Vergangene Events", "date", "past"),
			FilterOptionFactoryService.byKey("Zukünftige Events", "date", "upcoming")
		]
	}]);

	constructor(private stockService: StockService,
				private eventService: EventService) {
	}

	static byKey(name: string, key: string, ...values: string[]): MultiLevelSelectLeaf {
		return {
			query: [
				{
					key: key,
					values: values
				}
			],
			name,
			selected: false
		}
	}

	static min(name: string, key: string, value: any): MultiLevelSelectLeaf {
		const titleCaseKey = key.charAt(0).toUpperCase() + key.slice(1);
		return {
			query: [
				{
					key: "min" + titleCaseKey,
					values: [value.toString()]
				}
			],
			name,
			selected: false
		}
	}

	static max(name: string, key: string, value: any): MultiLevelSelectLeaf {
		const titleCaseKey = key.charAt(0).toUpperCase() + key.slice(1);
		return {
			query: [
				{
					key: "max" + titleCaseKey,
					values: [value.toString()]
				}
			],
			name,
			selected: false
		}
	}

	static combine(...leafs: MultiLevelSelectLeaf[]): MultiLevelSelectLeaf[] {
		return leafs.reduce((combinedList: MultiLevelSelectLeaf[], leaf: MultiLevelSelectLeaf) => {
			const index = combinedList.findIndex(it => it.name === leaf.name);
			if (index === -1) {
				combinedList.push(leaf);
			}
			else {
				for (let query of leaf.query) {
					const queryIndex = combinedList[index].query.findIndex(it => it.key === query.key);
					if (queryIndex === -1) {
						combinedList[index].query.push(query);
					}
					else {
						combinedList[index].query[queryIndex].values = Array.from(
							new Set([
								...combinedList[index].query[queryIndex].values,
								...query.values
							]).values()
						);
					}
				}
			}

			return combinedList;
		}, [])
	}

	get(type: FilterOptionType): (filter: Filter) => Observable<MultiLevelSelectParent[]> {
		switch (type) {
			case FilterOptionType.EVENT_CATEGORY:
				return this.getCategory;
			case FilterOptionType.PRICE:
				return this.getPrice;
			case FilterOptionType.DATE:
				return this.getDate;
				//todo move to server to avoid huge requests every time
			case FilterOptionType.COLOR:
				return this.getColorFilterOptions.bind(this);
			case FilterOptionType.MATERIAL:
				return this.getMaterialFilterOptions.bind(this);
			case FilterOptionType.SIZE:
				return this.getSizeFilterOptions.bind(this);
		}

		return () => throwError(new Error("No provider for type " + type));
	}

	private getSizeFilterOptions(filter: Filter): Observable<MultiLevelSelectParent[]> {
		return this.eventService.getAll(filter, Sort.none()).pipe(
			mergeMap(results => combineLatest(...results
				.filter(event => EventUtilityService.isMerchandise(event))
				.map(event => (<Merchandise>event))
				.map(merch => this.stockService.getByEventId(merch.id, Sort.none()))
			)),

			map((nestedStockList: MerchStockList[]) => nestedStockList
				.map(stockList => stockList.map(stockItem => stockItem.size))
				.reduce((acc: string[], sizes: string[]) =>
						[...acc, ...sizes.filter(size => !acc.find(it => it === size))],
					[])
				//remove duplicates
				.filter((size, index, array) => array.indexOf(size) === index)
				.map((size: string) => FilterOptionFactoryService.byKey(size, "size", size))),
			defaultIfEmpty([]),
			map(sizes => [{
				name: "Größe",
				selectType: (<"multiple" | "single">"multiple"),
				expanded: false,
				children: sizes
			}])
		);
	}

	private getMaterialFilterOptions(filter: Filter): Observable<MultiLevelSelectParent[]> {
		return this.eventService.getAll(filter, Sort.none()).pipe(
			map(results => results
				.filter(event => EventUtilityService.isMerchandise(event))
				.map(event => (<Merchandise>event))
				.map(merch => merch.material)
				.filter((material, index, array) => array.indexOf(material) === index)
				.sort(sortingFunction(obj => obj, false))
				.map(material => (FilterOptionFactoryService.byKey(material, "material", material)))),

			map(materials => [{
				name: "Material",
				selectType: "multiple" as "single" | "multiple",
				expanded: false,
				children: materials
			}])
		);
	}

	private getColorFilterOptions(filter: Filter): Observable<MultiLevelSelectParent[]> {

		return this.eventService.getAll(filter, Sort.none()).pipe(
			mergeMap(results => combineLatest(...results
				.filter(event => EventUtilityService.isMerchandise(event))
				.map(event => (<Merchandise>event))
				.map(merch => this.stockService.getByEventId(merch.id, Sort.none()))
			)),

			map((nestedStockList: MerchStockList[]) => nestedStockList
				.map(stockList => stockList.map(stockItem => stockItem.color))
				.reduce((acc: MerchColor[], colors: MerchColor[]) =>
						[...acc, ...colors.filter(color => !acc.find(it => it.name === color.name))],
					[])
				//remove duplicates
				.filter((color, index, array) => array.findIndex(_color => _color.name === color.name) === index)
				.sort(attributeSortingFunction("name", false))
				.map((color: MerchColor) => FilterOptionFactoryService.byKey(color.name, "color", color.name))),
			defaultIfEmpty([]),
			map(colors => [{
				name: "Farben",
				selectType: (<"multiple" | "single">"multiple"),
				expanded: false, children: colors
			}])
		);
	}
}
