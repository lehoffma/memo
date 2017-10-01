import {Component, OnInit} from '@angular/core';
import {MerchStockList} from "../../../../shared/model/merch-stock";
import {Merchandise} from "../../../../shared/model/merchandise";
import {StockService} from "../../../../../shared/services/api/stock.service";
import {EventService} from "../../../../../shared/services/api/event.service";
import {ActivatedRoute} from "@angular/router";

@Component({
	selector: 'memo-modify-merch-stock-container',
	templateUrl: './modify-merch-stock-container.component.html',
	styleUrls: ['./modify-merch-stock-container.component.scss']
})
export class ModifyMerchStockContainerComponent implements OnInit {
	stock: MerchStockList;
	noChanges = false; //todo

	merch: Merchandise;


	constructor(private stockService: StockService,
				private eventService: EventService,
				private activatedRoute: ActivatedRoute) {
	}

	ngOnInit() {
		this.activatedRoute.paramMap
			.filter(paramMap => paramMap.has("id"))
			.flatMap(paramMap => this.eventService.getById(+paramMap.get("id")))
			.map(event => (<Merchandise>event))
			.first()
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
			.first()
			.subscribe(stockList => {
				this.stock = [...stockList];
			});
	}

	goBack(){
		console.log("go back");
	}

	saveChanges(){
		console.log("save");
	}
}
