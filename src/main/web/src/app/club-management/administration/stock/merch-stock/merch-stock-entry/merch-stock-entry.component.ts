import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {StockEntry} from "./stock-entry";
import {WindowService} from "../../../../../shared/services/window.service";
import {MatDialog} from "@angular/material";
import {BehaviorSubject} from "rxjs";
import {filter, map} from "rxjs/operators";

@Component({
	selector: "memo-merch-stock-entry",
	templateUrl: "./merch-stock-entry.component.html",
	styleUrls: ["./merch-stock-entry.component.scss"]
})
export class MerchStockEntryComponent implements OnInit {
	@Output() onDelete = new EventEmitter<number>();
	private _stockEntry$ = new BehaviorSubject<StockEntry>(null);
	totals$ = this._stockEntry$
		.pipe(
			filter(it => it !== null),
			map(stockEntry => {
				const totals = {};
				stockEntry.options.size.forEach(size => {
					totals[size] = stockEntry.options.color
						.reduce((acc, color) => {
							return acc + stockEntry.stockMap[size][color.name];
						}, 0);
				});

				totals["total"] = Object.keys(totals)
					.reduce((acc, key) => acc + totals[key], 0);

				stockEntry.options.color.forEach(color => {
					totals[color.name] = stockEntry.options.size
						.reduce((acc, size) => {
							return acc + stockEntry.stockMap[size][color.name];
						}, 0);
				});

				return totals;
			})
		);

	constructor(public windowService: WindowService,
				public mdDialog: MatDialog) {
	}

	get stockEntry() {
		return this._stockEntry$.getValue();
	}

	@Input()
	set stockEntry(stockEntry: StockEntry) {
		this._stockEntry$.next(stockEntry);
	}

	ngOnInit() {
	}

	deleteMerch(id: number) {
		this.onDelete.emit(id);
	}

}
