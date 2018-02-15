import {Event} from "./event";
import {ClubRole} from "../../../shared/model/club-role";
import {SizeTable} from "./size-table";
import {EventOverviewKey} from "../../shop-item/item-details/container/overview/event-overview-key";
import {EventRoute} from "./route";
import {MerchColor} from "./merch-color";
import * as moment from "moment";
import {Moment} from "moment";
import {StockService} from "../../../shared/services/api/stock.service";
import {Observable} from "rxjs/Observable";
import {map} from "rxjs/operators";
import {EventType, typeToInteger} from "./event-type";

//todo remove demo
const sizeTable = `{
				"XS": {
					"Brustumfang": {
						"min": 78,
						"max": 81
					},
					"Tailenumfang": {
						"min": 82,
						"max": 85
					},
					"Hüftumfang": {
						"min": 86,
						"max": 89
					},
					"Modelllänge": {
						"min": 90,
						"max": 93
					},
					"Schulterbreite": {
						"min": 94,
						"max": 97
					}
				},
				"S": {
					"Brustumfang": {
						"min": 78,
						"max": 81
					},
					"Tailenumfang": {
						"min": 82,
						"max": 85
					},
					"Hüftumfang": {
						"min": 86,
						"max": 89
					},
					"Modelllänge": {
						"min": 90,
						"max": 93
					},
					"Schulterbreite": {
						"min": 94,
						"max": 97
					}
				},
				"M": {
					"Brustumfang": {
						"min": 78,
						"max": 81
					},
					"Tailenumfang": {
						"min": 82,
						"max": 85
					},
					"Hüftumfang": {
						"min": 86,
						"max": 89
					},
					"Modelllänge": {
						"min": 90,
						"max": 93
					},
					"Schulterbreite": {
						"min": 94,
						"max": 97
					}
				},
				"L": {
					"Brustumfang": {
						"min": 78,
						"max": 81
					},
					"Tailenumfang": {
						"min": 82,
						"max": 85
					},
					"Hüftumfang": {
						"min": 86,
						"max": 89
					},
					"Modelllänge": {
						"min": 90,
						"max": 93
					},
					"Schulterbreite": {
						"min": 94,
						"max": 97
					}
				},
				"XL": {
					"Brustumfang": {
						"min": 78,
						"max": 81
					},
					"Tailenumfang": {
						"min": 82,
						"max": 85
					},
					"Hüftumfang": {
						"min": 86,
						"max": 89
					},
					"Modelllänge": {
						"min": 90,
						"max": 93
					},
					"Schulterbreite": {
						"min": 94,
						"max": 97
					}
				},
				"XXL": {
					"Brustumfang": {
						"min": 78,
						"max": 81
					},
					"Tailenumfang": {
						"min": 82,
						"max": 85
					},
					"Hüftumfang": {
						"min": 86,
						"max": 89
					},
					"Modelllänge": {
						"min": 90,
						"max": 93
					},
					"Schulterbreite": {
						"min": 94,
						"max": 97
					}
				}
			}`;


export class Merchandise extends Event {
	public sizes: string[];

	constructor(id: number,
				title: string,
				date: Moment,
				description: string,
				expectedReadRole: ClubRole,
				expectedCheckInRole: ClubRole,
				expectedWriteRole: ClubRole,
				route: EventRoute,
				images: string[],
				capacity: number,
				public colors: MerchColor[],
				public material: string,
				private _sizeTable: SizeTable,
				price: number) {
		super(id, title, date, description, expectedReadRole, expectedCheckInRole,
			expectedWriteRole, route, images, capacity, price, typeToInteger(EventType.merch));
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
			//todo besseres label oder komplett weg?
			// {
			// 	key: "expectedRole",
			// 	label: "Für"
			// },
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

	get sizeTableCategories(): string[] {
		return Object.keys(this.sizeTable).reduce((previousValue, currentValue) =>
				previousValue.concat(...Object.keys(this.sizeTable[currentValue])
					.filter(category => previousValue.indexOf(category) === -1)),
			[])
	}

	static capacity$(stockService: StockService, id: number): Observable<number> {
		return stockService.getByEventId(id)
			.pipe(
				map(stock => stock.reduce((sum, it) => sum + it.amount, 0))
			);
	}

	static create() {
		return new Merchandise(-1, "", moment(), "", ClubRole.None, ClubRole.None, ClubRole.None, [],
			["resources/images/Logo.png"], -1, [], "",
			JSON.parse(sizeTable), -1);
	}
}
