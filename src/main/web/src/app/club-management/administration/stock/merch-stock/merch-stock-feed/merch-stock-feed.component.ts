import {Component, Input, OnInit} from "@angular/core";
import {StockService} from "../../../../../shared/services/api/stock.service";
import {EventService} from "../../../../../shared/services/api/event.service";
import {StockEntry} from "../merch-stock-entry/stock-entry";
import {Merchandise} from "../../../../../shop/shared/model/merchandise";
import {MerchColor} from "../../../../../shop/shared/model/merch-color";
import {BehaviorSubject, Observable} from "rxjs";
import {filter, map} from "rxjs/operators";

@Component({
	selector: "memo-merch-stock-feed",
	templateUrl: "./merch-stock-feed.component.html",
	styleUrls: ["./merch-stock-feed.component.scss"]
})
export class MerchStockFeedComponent implements OnInit {
	stockEntries$ = new BehaviorSubject([]);
	merch$: Observable<{
		item: Merchandise,
		emptyOptions: {
			[size: string]: MerchColor
		}
	}[]> = this.stockEntries$
		.pipe(
			filter(it => it !== null),
			map((dataList: StockEntry[]) => {
				return dataList
				//contains at least one size/color pair that is not in stock
					.filter(dataItem => Object.keys(dataItem.stockMap)
						.some(size => Object.keys(dataItem.stockMap[size])
							.some(colorName => dataItem.stockMap[size][colorName] === 0)))
					.map(dataItem => ({
						item: dataItem.item,
						emptyOptions: Object.keys(dataItem.stockMap)
							.filter(size => Object.keys(dataItem.stockMap[size])
								.some(colorName => dataItem.stockMap[size][colorName] === 0))
							.reduce((options, size) => {
								options[size] = Object.keys(dataItem.stockMap[size])
									.filter(colorName => dataItem.stockMap[size][colorName] === 0)
									.map(colorName => dataItem.options.color
										.find(color => color.name === colorName));
								return options;
							}, {})
					}))
			})
		);

	constructor(private eventService: EventService,
				private stockService: StockService) {
	}

	@Input() set stockEntryList(entries: StockEntry[]) {
		this.stockEntries$.next(entries);
	}

	ngOnInit() {
	}


	keysOfObject(object: any) {
		return Object.keys(object);
	}

	deleteMerch(id: number) {
		console.warn("deleting merch not implemented yet. ", id);
	}
}
