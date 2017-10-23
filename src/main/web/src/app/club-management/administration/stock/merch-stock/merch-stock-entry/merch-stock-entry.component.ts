import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {StockEntry} from "./stock-entry";
import {BehaviorSubject} from "rxjs/Rx";
import {WindowService} from "../../../../../shared/services/window.service";
import {MdDialog} from "@angular/material";
import {ModifyStockDialogComponent} from "./modify-stock-dialog.component";

@Component({
	selector: 'memo-merch-stock-entry',
	templateUrl: './merch-stock-entry.component.html',
	styleUrls: ['./merch-stock-entry.component.scss']
})
export class MerchStockEntryComponent implements OnInit {
	private _stockEntry$ = new BehaviorSubject<StockEntry>(null);


	@Input()
	set stockEntry(stockEntry: StockEntry) {
		this._stockEntry$.next(stockEntry);
	}

	get stockEntry() {
		return this._stockEntry$.getValue();
	}

	totals$ = this._stockEntry$
		.filter(it => it !== null)
		.map(stockEntry => {
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
		});

	@Output() onDelete = new EventEmitter<number>();

	constructor(public windowService: WindowService,
				public mdDialog: MdDialog) {
	}

	ngOnInit() {
	}

	deleteMerch(id: number) {
		this.onDelete.emit(id);
	}

	/**
	 *
	 */
	openModifyStockDialog() {
		this.mdDialog.open(ModifyStockDialogComponent, {
			data: {
				merch: this._stockEntry$.getValue().item
			}
		})
	}
}
