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
	//todo move to server
	//todo le
	merch$: Observable<{
		item: Merchandise,
		emptyOptions: {
			color: MerchColor;
			size: string;
		}[]
	}[]> = this.stockEntries$
		.pipe(
			filter(it => it !== null),
			map((dataList: StockEntry[]) => {

				return dataList
					.filter(entry => entry.stock.some(stock => stock.amount === 0))
					.map(entry => ({
						item: entry.item,
						emptyOptions: entry.stock.filter(stock => stock.amount === 0)
							.map(it => ({
								color: it.color,
								size: it.size
							}))
					}));
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
