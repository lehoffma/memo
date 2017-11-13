import {Component, OnInit} from '@angular/core';
import {MerchStockList} from "../../../../shared/model/merch-stock";
import {Merchandise} from "../../../../shared/model/merchandise";
import {StockService} from "../../../../../shared/services/api/stock.service";
import {EventService} from "../../../../../shared/services/api/event.service";
import {ActivatedRoute} from "@angular/router";
import {Location} from "@angular/common";
import {filter, first, map, mergeMap} from "rxjs/operators";

@Component({
	selector: 'memo-modify-merch-stock-container',
	templateUrl: './modify-merch-stock-container.component.html',
	styleUrls: ['./modify-merch-stock-container.component.scss']
})
export class ModifyMerchStockContainerComponent implements OnInit {
	previousStock: MerchStockList;
	stock: MerchStockList;
	noChanges = false; //todo

	merch: Merchandise;


	constructor(private stockService: StockService,
				private eventService: EventService,
				private location: Location,
				private activatedRoute: ActivatedRoute) {
	}

	ngOnInit() {
		this.activatedRoute.paramMap
			.pipe(
				filter(paramMap => paramMap.has("id")),
				mergeMap(paramMap => this.eventService.getById(+paramMap.get("id"))),
				map(event => (<Merchandise>event)),
				first()
			)
			.subscribe(merch => {
				this.merch = merch;
				this.extractStock(this.merch);
			})
	}

	/**
	 *
	 * @param merch
	 */
	extractStock(merch: Merchandise) {
		this.stockService.getByEventId(merch.id)
			.pipe(first())
			.subscribe(stockList => {
				this.stock = [...stockList];
				this.previousStock = [...stockList];
			});
	}

	goBack(){
		this.location.back();
	}

	saveChanges(){
		this.stockService.pushChanges(this.merch, [...this.previousStock], [...this.stock])
			.subscribe(result => {
				this.goBack();
			}, error => {
				console.error(error);
			})
	}
}
