import {Event} from "./event";
import {ClubRole} from "../../../shared/model/club-role";
import {SizeTable} from "./size-table";
import {SelectionModel} from "../../../shared/model/selection-model";
import {EventOverviewKey} from "../../item-details/container/overview/event-overview-key";

export class Merchandise extends Event {

	constructor(id: number,
				title: string,
				date: Date,
				description: string,
				expectedRole: ClubRole,
				imagePath: string,
				capacity: number,
				public colors: string[],
				public material: string,
				public sizeTable: SizeTable,
				priceMember: number,
				price: number,
				meetingPoint: number) {
		super(id, title, date, description, expectedRole, imagePath, capacity, priceMember, meetingPoint, price);
	}

	static create() {
		return new Merchandise(-1, "", new Date(1999, 9, 19), "", ClubRole.None, "", -1, [], "", {}, -1, -1, -1);
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

	get colorsAsHex() {
		//TODO: weniger blöd machen
		return this.colors.map(color => {
			if (color === "Weiss") {
				return "#ffffff"
			}
			if (color === "Blau") {
				return "#0000ff"
			}
			if (color === "Grün") {
				return "#00ff00";
			}
			return color;
		})
	}

	get clothesSizes(): string[] {
		return Object.keys(this.sizeTable);
	}

	get colorSelections(): SelectionModel[] {
		return this.colors.map(color => ({
			value: color,
			color: color
		}))
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
