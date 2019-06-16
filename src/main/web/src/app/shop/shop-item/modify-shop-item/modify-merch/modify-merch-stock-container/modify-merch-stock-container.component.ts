import {Component, OnInit} from "@angular/core";
import {MerchStock, MerchStockList} from "../../../../shared/model/merch-stock";
import {Merchandise} from "../../../../shared/model/merchandise";
import {StockService} from "../../../../../shared/services/api/stock.service";
import {EventService} from "../../../../../shared/services/api/event.service";
import {ActivatedRoute, Router} from "@angular/router";
import {Location} from "@angular/common";
import {filter, first, map, mergeMap} from "rxjs/operators";
import {FormBuilder, FormGroup} from "@angular/forms";
import {Sort} from "../../../../../shared/model/api/sort";
import {flatMap} from "../../../../../util/util";
import {MatSnackBar} from "@angular/material";

@Component({
	selector: "memo-modify-merch-stock-container",
	templateUrl: "./modify-merch-stock-container.component.html",
	styleUrls: ["./modify-merch-stock-container.component.scss"]
})
export class ModifyMerchStockContainerComponent implements OnInit {
	formGroup: FormGroup = this.formBuilder.group({});
	previousStock: MerchStockList;
	stock: MerchStockList;

	merch: Merchandise;


	constructor(private stockService: StockService,
				private eventService: EventService,
				private formBuilder: FormBuilder,
				private location: Location,
				private snackBar: MatSnackBar,
				private router: Router,
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
		const value: { [colorAsJson: string]: MerchStock[] } = this.formGroup.value;
		const jsonColors: string[] = Object.keys(value);

		const stockList = flatMap(jsonColor => value[jsonColor].map(stock => ({
			...stock,
			color: JSON.parse(jsonColor)
		})), jsonColors)
			.map(it => {
				it.item = this.merch;
				return it;
			});

		this.stockService.pushChanges(this.merch, [...this.previousStock], [...stockList])
			.subscribe(result => {
				this.router.navigate([".."], {relativeTo: this.activatedRoute});
				this.snackBar.open("Änderungen wurden erfolgreich gespeichert!");
			}, error => {
				console.error(error);
				this.snackBar.open("Error! Änderungen konnten leider nicht gespeichert werden.");
			})
	}
}
