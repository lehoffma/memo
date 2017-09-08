import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {MerchStock} from "../../../../shared/model/merch-stock";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {ExpandableTableColumn} from "../../../../../shared/expandable-table/expandable-table-column";
import {ColumnSortingEvent} from "../../../../../shared/expandable-table/column-sorting-event";
import {Observable} from "rxjs/Observable";
import {attributeSortingFunction, getId, sortingFunction} from "../../../../../util/util";
import {MerchColorCellComponent} from "./merch-color-cell.component";
import {MdDialog} from "@angular/material";
import {ModifyMerchStockItemComponent} from "./modify-merch-stock-item/modify-merch-stock-item.component";
import {ModifyStockItemEvent} from "./modify-merch-stock-item/modify-stock-item-event";
import {ModifyType} from "../../modify-type";
import {ActionPermissions} from "../../../../../shared/expandable-table/expandable-table.component";
import {LogInService} from "../../../../../shared/services/api/login.service";

@Component({
	selector: "memo-modify-merch-stock",
	templateUrl: "./modify-merch-stock.component.html",
	styleUrls: ["./modify-merch-stock.component.scss"]
})
export class ModifyMerchStockComponent implements OnInit {
	_sortBy: BehaviorSubject<ColumnSortingEvent<MerchStock>> = new BehaviorSubject<ColumnSortingEvent<MerchStock>>({
		key: "size",
		descending: true
	});
	sortBy = this._sortBy.asObservable();

	merchStockSubject: BehaviorSubject<MerchStock[]> = new BehaviorSubject([]);
	merchStockObservable = Observable.combineLatest(this.merchStockSubject, this.sortBy)
		.map(([merchStock, sortBy]) => {
			return [...merchStock]
				.map((stock) => ({
					id: stock["id"],
					size: stock.size,
					color: Object.assign({}, stock.color),
					amount: stock.amount,
				}))
				.sort(sortBy.key === "color"
					? sortingFunction<MerchStock>(obj => obj.color.name, sortBy.descending)
					: attributeSortingFunction(sortBy.key, sortBy.descending));
		});
	@Output() stockChange = new EventEmitter();
	permissions$: Observable<ActionPermissions> = this.loginService.getActionPermissions("stock");
	primaryColumnKeys: ExpandableTableColumn<MerchStock>[] = [
		new ExpandableTableColumn<MerchStock>("Größe", "size"),
		new ExpandableTableColumn<MerchStock>("Farbe", "color", MerchColorCellComponent),
		new ExpandableTableColumn<MerchStock>("Anzahl", "amount")
	];

	constructor(private mdDialog: MdDialog,
				private loginService: LogInService) {
	}

	@Input()
	set stock(value) {
		this.merchStockSubject.next(value ? value : []);
	}

	get merchStock() {
		return this.merchStockSubject.getValue();
	}

	set merchStock(value: MerchStock[]) {
		this.stock = value;
		this.stockChange.emit(value);
	}

	ngOnInit() {
	}

	updateSortBy(event: ColumnSortingEvent<MerchStock>) {
		this._sortBy.next(event);
	}


	// edit ruft dann dialog auf, in dem size, color & amount felder drin sind
	// beim editieren stehen für size&color dann bereits verwendete werte zur verfügung,
	// aber es kann auch ein neuer hinzugefügt werden

	/**
	 * Ruft den modify dialog mit den gegebenen daten auf
	 * @param data
	 * @returns {Observable<any>}
	 */
	openModifyStockItemDialog(data: any = {}) {
		this.mdDialog.open(ModifyMerchStockItemComponent, {data})
			.afterClosed()
			.subscribe((event: ModifyStockItemEvent) => {
				switch (event.modifyType) {
					case ModifyType.ADD:
						let index = this.merchStock
							.findIndex(stockItem => stockItem.color.name === event.color.name
								&& stockItem.size === event.size);
						if (index === -1) {
							this.merchStock = [...this.merchStock, {
								id: getId(event.size + event.color.name),
								size: event.size,
								color: Object.assign({}, event.color),
								amount: event.amount
							}];
						}
						else {
							this.merchStock = [
								...this.merchStock.slice(0, index),
								{
									...this.merchStock[index],
									amount: this.merchStock[index].amount + event.amount
								},
								...this.merchStock.slice(index + 1)
							]
						}


						break;
					case ModifyType.EDIT:
						this.merchStock = this.merchStock.map(stock => {
							if (stock["id"] === event.modifiedStock["id"]) {
								return {
									id: event.modifiedStock.id,
									size: event.size,
									color: Object.assign({}, event.color),
									amount: event.amount
								}
							}
							return stock;
						})
				}
			})
	}

	/**
	 *
	 * @param event
	 */
	addStock() {
		this.openModifyStockItemDialog()
	}

	/**
	 *
	 * @param event
	 */
	editStock(event: MerchStock) {
		this.openModifyStockItemDialog({
			color: event.color,
			size: event.size,
			amount: event.amount,
			modifiedStock: Object.assign({}, event)
		});
	}

	/**
	 *
	 * @param stockEntriesToDelete
	 */
	deleteStock(stockEntriesToDelete: MerchStock[]) {
		this.merchStock = this.merchStock
			.filter(stock =>
				!stockEntriesToDelete
					.find(stockToDelete => stockToDelete.size === stock.size && stockToDelete.color.name === stock.color.name)
			);
	}
}
