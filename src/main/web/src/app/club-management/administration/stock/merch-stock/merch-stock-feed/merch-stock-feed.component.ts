import {Component, OnInit} from '@angular/core';
import {StockService} from "../../../../../shared/services/api/stock.service";
import {EventService} from "../../../../../shared/services/api/event.service";
import {EventType} from "app/shop/shared/model/event-type";
import {Observable} from "rxjs/Observable";
import {StockEntry} from "../merch-stock-entry/stock-entry";
import {Merchandise} from "../../../../../shop/shared/model/merchandise";
import {MerchColor} from "../../../../../shop/shared/model/merch-color";

@Component({
	selector: 'memo-merch-stock-feed',
	templateUrl: './merch-stock-feed.component.html',
	styleUrls: ['./merch-stock-feed.component.scss']
})
export class MerchStockFeedComponent implements OnInit {
	merch$:Observable<{
		item: Merchandise,
		emptyOptions: {
			[size: string]: MerchColor
		}
	}[]> = this.eventService.search("", EventType.merch)
		.flatMap(merch => Observable.combineLatest(
			...merch.map(merchItem => this.stockService.getByEventId(merchItem.id)
				.map(stockList => ({
					stockMap: this.stockService.toStockMap(stockList),
					options: this.stockService.getStockOptions([stockList]),
					item: merchItem
				})))
		))
		.map((dataList: StockEntry[]) => {
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
		});

	constructor(private eventService: EventService,
				private stockService: StockService) {
	}

	ngOnInit() {
	}


	keysOfObject(object:any){
		return Object.keys(object);
	}
}
