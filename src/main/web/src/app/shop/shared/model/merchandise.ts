import {Event} from "./event";
import {ClubRole} from "../../../shared/model/club-role";
import {SizeTable} from "./size-table";
import {SelectionModel} from "../../../shared/model/selection-model";
import {EventOverviewKey} from "../../shop-item/item-details/container/overview/event-overview-key";
import {EventRoute} from "./route";
import {MerchColor} from "./merch-color";

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
				public colors: MerchColor[],
				public material: string,
				private _sizeTable: SizeTable,
				priceMember: number,
				price: number) {
		super(id, title, date, description, expectedRole, route, imagePath, capacity, priceMember, price);
	}

	static create() {
		return new Merchandise(-1, "", new Date(1999, 9, 19), "", ClubRole.None, [], "", -1, [], "", {}, -1, -1);
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
