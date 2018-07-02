import {Component, OnInit} from "@angular/core";
import {MerchStockList} from "../../../../shared/model/merch-stock";
import {Merchandise} from "../../../../shared/model/merchandise";
import {StockService} from "../../../../../shared/services/api/stock.service";
import {EventService} from "../../../../../shared/services/api/event.service";
import {ActivatedRoute} from "@angular/router";
import {Location} from "@angular/common";
import {filter, first, map, mergeMap} from "rxjs/operators";
import {FormBuilder, FormControl} from "@angular/forms";
import {Sort} from "../../../../../shared/model/api/sort";

@Component({
	selector: "memo-modify-merch-stock-container",
	templateUrl: "./modify-merch-stock-container.component.html",
	styleUrls: ["./modify-merch-stock-container.component.scss"]
})
export class ModifyMerchStockContainerComponent implements OnInit {
	formControl: FormControl = this.formBuilder.control([]);
	previousStock: MerchStockList;
	stock: MerchStockList;

	merch: Merchandise;


	constructor(private stockService: StockService,
				private eventService: EventService,
				private formBuilder: FormBuilder,
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
		//todo?
		this.stockService.getByEventId(merch.id, Sort.none())
			.subscribe(stockList => {
				this.stock = [...stockList];
				this.previousStock = [...stockList];
			});
	}

	goBack() {
		this.location.back();
	}

	saveChanges() {
		let newStock: MerchStockList = this.formControl.value;
		newStock = newStock.map(it => {
			it.item = this.merch;
			return it;
		});
		this.stockService.pushChanges(this.merch, [...this.previousStock], [...newStock])
			.subscribe(result => {
				this.goBack();
			}, error => {
				console.error(error);
			})
	}
}
