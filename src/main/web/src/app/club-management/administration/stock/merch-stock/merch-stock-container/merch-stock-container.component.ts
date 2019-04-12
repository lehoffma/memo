import {Component, OnInit} from "@angular/core";
import {Observable, Subject} from "rxjs";
import {MerchStock} from "../../../../../shop/shared/model/merch-stock";
import {ActivatedRoute} from "@angular/router";
import {map, mergeMap, switchMap} from "rxjs/operators";
import {StockService} from "../../../../../shared/services/api/stock.service";
import {stockAmountToStatus, StockEntry} from "../merch-stock-entry/stock-entry";
import {EventService} from "../../../../../shared/services/api/event.service";
import {Merchandise} from "../../../../../shop/shared/model/merchandise";

@Component({
	selector: "memo-merch-stock-container",
	templateUrl: "./merch-stock-container.component.html",
	styleUrls: ["./merch-stock-container.component.scss"]
})
export class MerchStockContainerComponent implements OnInit {
	merchStock$: Observable<StockEntry> = this.activatedRoute.params
		.pipe(
			switchMap(params => this.itemService.valueChanges<Merchandise>(+params["id"])),
			mergeMap(item => this.stockService.getByEventId(item.id)
				.pipe(
					map(stock => stock.map(it => ({
						...it,
						status: stockAmountToStatus(it.amount),
					}))),
					map(stock => ({
						item,
						stock
					}))
				)
			),
		);

	onDestroy$ = new Subject();
	constructor(private activatedRoute: ActivatedRoute,
				private itemService: EventService,
				private stockService: StockService) {

	}

	ngOnInit() {
	}

}
