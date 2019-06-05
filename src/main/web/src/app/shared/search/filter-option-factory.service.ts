import {Injectable} from "@angular/core";
import {SearchResultsFilterOption} from "./search-results-filter-option";
import {Merchandise} from "../../shop/shared/model/merchandise";
import {StockService} from "../services/api/stock.service";
import {Observable, of, throwError} from "rxjs";
import {map} from "rxjs/operators";
import {MultiLevelSelectLeaf} from "../utility/multi-level-select/shared/multi-level-select-leaf";
import {EventType, typeToInteger} from "../../shop/shared/model/event-type";
import {Filter} from "../model/api/filter";
import {EventService} from "../services/api/event.service";
import {MultiFilterOption} from "./filter-options/multi-filter-option";
import {SingleFilterOption} from "./filter-options/single-filter-option";
import {FilterOption} from "./filter-options/filter-option";

@Injectable({
	providedIn: "root"
})
export class FilterOptionFactoryService {

	readonly category: MultiFilterOption = new MultiFilterOption(
		"type",
		"Kategorie",
		[
			{
				key: "tours", label: "Fahrten", query: [
					{key: "type", value: "" + typeToInteger(EventType.tours)}
				]
			},
			{
				key: "partys", label: "Veranstaltungen", query: [
					{key: "type", value: "" + typeToInteger(EventType.partys)}
				]
			},
			{
				key: "merch", label: "Merchandise", query: [
					{key: "type", value: "" + typeToInteger(EventType.merch)}
				]
			},
		],
	);

	readonly price: SingleFilterOption = new SingleFilterOption(
		"price",
		"Preis",
		[
			{key: SingleFilterOption.ALL_OPTION, label: SingleFilterOption.ALL_OPTION, query: []},
			{
				label: "Unter 10 Euro", key: "below10", query: [
					{key: "maxPrice", value: 10}
				]
			},
			{
				label: "10 bis 50 Euro", key: "between10and50", query: [
					{key: "minPrice", value: 10.01},
					{key: "maxPrice", value: 50},
				]
			},
			{
				label: "50 bis 100 Euro", key: "between50and100", query: [
					{key: "minPrice", value: 50.01},
					{key: "maxPrice", value: 100},
				]
			},
			{
				label: "Über 100 Euro", key: "above100", query: [
					{key: "minPrice", value: 100.01},
				]
			}
		]
	);

	readonly date: SingleFilterOption = new SingleFilterOption(
		"date",
		"Datum",
		[
			{key: SingleFilterOption.ALL_OPTION, label: SingleFilterOption.ALL_OPTION, query: []},
			{
				label: "Vergangene Events",
				key: "past",
				query: [{key: "date", value: "past"}]
			},
			{
				label: "Zukünftige Events",
				key: "upcoming",
				query: [{key: "date", value: "upcoming"}]
			}
		]
	);

	//todo
	readonly getCategory: () => Observable<FilterOption> = () => of(this.category);
	readonly getPrice: () => Observable<FilterOption> = () => of(this.price);
	readonly getDate: () => Observable<FilterOption> = () => of(this.date);

	constructor(private stockService: StockService,
				private eventService: EventService) {
	}

	get(type: SearchResultsFilterOption): (filter: Filter) => Observable<FilterOption> {
		switch (type) {
			case SearchResultsFilterOption.EVENT_CATEGORY:
				return this.getCategory;
			case SearchResultsFilterOption.PRICE:
				return this.getPrice;
			case SearchResultsFilterOption.DATE:
				return this.getDate;
			case SearchResultsFilterOption.COLOR:
				return this.getColorFilterOptions.bind(this);
			case SearchResultsFilterOption.MATERIAL:
				return this.getMaterialFilterOptions.bind(this);
			case SearchResultsFilterOption.SIZE:
				return this.getSizeFilterOptions.bind(this);
		}

		return () => throwError(new Error("No provider for type " + type));
	}

	private getSizeFilterOptions(filter: Filter): Observable<FilterOption> {
		return this.eventService.getSizes(filter).pipe(
			map(sizes => {
				return new MultiFilterOption(
					"size",
					"Größe",
					sizes.map(size => ({
						key: size,
						label: size,
						query: [{key: "size", value: size}]
					}))
				)
			})
		);
	}

	private getMaterialFilterOptions(filter: Filter): Observable<FilterOption> {
		return this.eventService.getMaterials(filter).pipe(
			map(materials => {
				return new MultiFilterOption(
					"material",
					"Material",
					materials.map(material => ({
						key: material,
						label: material,
						query: [{key: "material", value: material}]
					}))
				)
			})
		);
	}

	private getColorFilterOptions(filter: Filter): Observable<FilterOption> {
		return this.eventService.getColors(filter).pipe(
			map(colors => {
				return new MultiFilterOption(
					"color",
					"Farbe",
					colors.map(color => ({
						key: color.name,
						label: color.name,
						query: [{key: "color", value: color.name}]
					}))
				)
			})
		);
	}
}
