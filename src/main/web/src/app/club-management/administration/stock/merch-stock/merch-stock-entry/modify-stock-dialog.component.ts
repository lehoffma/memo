import {Component, Inject, OnInit} from '@angular/core';
import {MD_DIALOG_DATA, MdDialogRef} from "@angular/material";
import {Merchandise} from "../../../../../shop/shared/model/merchandise";
import {MerchStockList} from "../../../../../shop/shared/model/merch-stock";
import {StockService} from "../../../../../shared/services/api/stock.service";

@Component({
	selector: 'memo-modify-stock-dialog',
	templateUrl: './modify-stock-dialog.component.html',
	styleUrls: ['./modify-stock-dialog.component.scss']
})
export class ModifyStockDialogComponent implements OnInit {
	stock: MerchStockList;
	noChanges = false; //todo

	merch: Merchandise;

	constructor(private dialogRef: MdDialogRef<ModifyStockDialogComponent>,
				private stockService: StockService,
				@Inject(MD_DIALOG_DATA) public data: any) {
	}

	ngOnInit() {
		this.merch = this.data.merch;
		this.extractStock(this.merch);
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

	saveChanges() {
		//todo remove demo
		//todo replace with non-dialog version?
		//todo stock api post/put
		console.warn("We still haven't really decided how we want to approach this situation. Or I at least forgot what we ended up with.")
		// this.stockService.

		this.close();
	}

	close(){
		this.dialogRef.close();
	}
}
