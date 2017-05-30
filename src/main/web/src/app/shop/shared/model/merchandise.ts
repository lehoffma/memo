import {Event} from "./event";
import {ClubRole} from "../../../shared/model/club-role";
import {SizeTable} from "./size-table";
import {SelectionModel} from "../../../shared/model/selection-model";
import {EventOverviewKey} from "../../item-details/container/overview/event-overview-key";
import {EventRoute} from "./route";
import {MerchColor} from "./merch-color";
import {MerchStockList} from "./merch-stock";

export class Merchandise extends Event {
	public sizes: string[];

	constructor(id: number,
				title: string,
				date: Date,
				description: string,
				expectedRole: ClubRole,
				route: EventRoute,
				imagePath: string,
				capacity: number,
				public stock: MerchStockList,
				public colors: MerchColor[],
				public material: string,
				private _sizeTable: SizeTable,
				priceMember: number,
				price: number) {
		super(id, title, date, description, expectedRole, route, imagePath, capacity, priceMember, price);
	}

	static create() {
		return new Merchandise(-1, "", new Date(1999, 9, 19), "", ClubRole.None, [], "", -1, [], [], "", {}, -1, -1);
	}

	static getStockOptions(merchList: Merchandise[]){
		return {
			size: merchList.reduce((sizes, current) => {
				current.stock
					.forEach(stock => {
						if (!sizes.includes(stock.size)) {
							sizes.push(stock.size);
						}
					});
				return sizes;
			}, []),
			color: merchList.reduce((colors, current) => {
				current.stock
					.forEach(stock => {
						if (!colors.find(color => color === stock.color.name)) {
							colors.push(stock.color.name);
						}
					});
				return colors;
			}, [])
		};
	}

	static mapToStockObject(merchList:Merchandise[]){
		let options = Merchandise.getStockOptions(merchList);

		/**
		 *
		 * @param merch
		 * @param options
		 * @param stockKey
		 * @param optionsKey
		 * @param stockValue
		 * @returns {Array}
		 */
		let getStockAmountList = function(merch: Merchandise, options: { [key: string]: string[] }, stockKey: string, optionsKey: string, stockValue: string) {
			let list = merch.stock
				.filter(stock => stock[stockKey] === stockValue || stock[stockKey].name === stockValue)
				.reduce((acc, stock) => {
					let index = options[optionsKey].findIndex(option =>
						option === stock[optionsKey] || option === stock[optionsKey].name
					);
					acc[index] = stock.amount;
					return acc;
				}, []);

			list.push(list.reduce((acc, val) => acc + val, 0));

			return list;
		};


		return merchList.map(merchObject => {
			let transformedMerch: any = {id: merchObject.id};
			options.size.forEach(size => {
				transformedMerch[size] = getStockAmountList(merchObject, options, "size", "color", size);
			});
			options.color.forEach(color => {
				transformedMerch[color] = getStockAmountList(merchObject, options, "color", "size", color);
			});
			transformedMerch["title"] = merchObject.title;
			transformedMerch["total"] = options.size.reduce(
				(acc, size) => acc + transformedMerch[size][transformedMerch[size].length - 1]
				, 0
			);

			return transformedMerch;
		})
	}

	getAmountOf(color: MerchColor, size: string) {
		if (!color && !size) {
			return undefined;
		}
		return this.stock.find(stockItem => stockItem.color.name === color.name &&
		stockItem.color.hex === color.hex && stockItem.size === size).amount;
	}

	get sizeTable() {
		return this._sizeTable;
	}

	set sizeTable(value) {
		this._sizeTable = value;
		this.sizes = this.clothesSizes;
	}

	get overviewKeys(): EventOverviewKey[] {
		return [
			{
				key: "price",
				label: "Preis",
				pipe: "price"
			},
			{
				key: "material",
				label: "Material",
			},
			{
				key: "capacity",
				label: "Auf Lager",
			},
			{
				key: "expectedRole",
				label: "Für"
			},
		];
	}

	get detailsTableKeys(): EventOverviewKey[] {
		return [
			{
				key: "date",
				label: "Datum",
				pipe: "date"
			},
			{
				key: "capacity",
				label: "Auf Vorrat"
			},
			{
				key: "price",
				label: "Preis",
				pipe: "price"
			},
			{
				key: "material",
				label: "Material"
			}
		]
	}

	get clothesSizes(): string[] {
		return Object.keys(this.sizeTable);
	}

	get clothesSizeSelections(): SelectionModel[] {
		return this.clothesSizes.map(size => ({
			value: size,
			color: "white",
			text: size
		}));
	}

	get sizeTableCategories(): string[] {
		return Object.keys(this.sizeTable).reduce((previousValue, currentValue) =>
				previousValue.concat(...Object.keys(this.sizeTable[currentValue])
					.filter(category => previousValue.indexOf(category) === -1)),
			[])
	}
}
