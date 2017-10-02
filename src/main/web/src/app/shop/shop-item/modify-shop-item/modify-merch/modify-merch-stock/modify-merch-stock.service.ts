import {Injectable} from '@angular/core';
import {ExpandableTableContainerService} from "../../../../../shared/expandable-table/expandable-table-container.service";
import {MerchStock} from "../../../../shared/model/merch-stock";
import {ColumnSortingEvent} from "../../../../../shared/expandable-table/column-sorting-event";
import {attributeSortingFunction, getId, SortingFunction, sortingFunction} from "../../../../../util/util";
import {LogInService} from "../../../../../shared/services/api/login.service";
import {ModifyMerchStockItemComponent} from "./modify-merch-stock-item/modify-merch-stock-item.component";
import {ModifyStockItemEvent} from "./modify-merch-stock-item/modify-stock-item-event";
import {ModifyType} from "../../modify-type";
import {MdDialog} from "@angular/material";
import {ExpandableTableColumn} from "../../../../../shared/expandable-table/expandable-table-column";
import {MerchColorCellComponent} from "./merch-color-cell.component";

@Injectable()
export class ModifyMerchStockService extends ExpandableTableContainerService<MerchStock> {

	constructor(private loginService: LogInService,
				private mdDialog: MdDialog) {
		super({
				key: "size",
				descending: true
			},
			loginService.getActionPermissions("stock"),
			[]);

		this.primaryColumnKeys$.next([
			new ExpandableTableColumn<MerchStock>("Größe", "size"),
			new ExpandableTableColumn<MerchStock>("Farbe", "color", MerchColorCellComponent),
			new ExpandableTableColumn<MerchStock>("Anzahl", "amount")
		]);
	}


	/**
	 *
	 * @param {ModifyStockItemEvent} event
	 */
	addStock(event: ModifyStockItemEvent) {
		event.sizes.forEach(size => {
			const index = this.dataSubject$.getValue()
				.findIndex(stockItem => stockItem.color.name === event.color.name
					&& stockItem.size === size);

			//this stock item hasn't been added to the list yet
			if (index === -1) {
				this.dataSubject$.next([...this.dataSubject$.getValue(), {
					id: getId(size + event.color.name),
					event: event.event,
					size: size,
					color: Object.assign({}, event.color),
					amount: event.amount
				}]);
			}
			//the stock item is already part of the list => simply increase amount
			else {
				this.dataSubject$.next([
					...this.dataSubject$.getValue().slice(0, index),
					{
						...this.dataSubject$.getValue()[index],
						amount: this.dataSubject$.getValue()[index].amount + event.amount
					},
					...this.dataSubject$.getValue().slice(index + 1)
				]);
			}
		});
	}

	/**
	 *
	 * @param {ModifyStockItemEvent} event
	 */
	editStock(event: ModifyStockItemEvent) {
		//todo multiple sizes
		this.dataSubject$.next(this.dataSubject$.getValue().map(stock => {
			if (stock["id"] === event.modifiedStock["id"]) {
				return {
					id: event.modifiedStock.id,
					event: event.event,
					size: event.sizes[0],
					color: Object.assign({}, event.color),
					amount: event.amount
				}
			}
			return stock;
		}));
	}


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
						this.addStock(event);
						break;
					case ModifyType.EDIT:
						this.editStock(event);
				}
			})
	}


	/**
	 *
	 * @param event
	 */
	add() {
		this.openModifyStockItemDialog()
	}

	/**
	 *
	 * @param event
	 */
	edit(event: MerchStock) {
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
	remove(stockEntriesToDelete: MerchStock[]) {
		this.dataSubject$.next(this.dataSubject$.getValue().filter(stock =>
			!stockEntriesToDelete
				.find(stockToDelete => stockToDelete.size === stock.size
					&& stockToDelete.color.name === stock.color.name)
		));
	}

	satisfiesFilter(entry: MerchStock, ...options): boolean {
		return true;
	}

	comparator(sortBy: ColumnSortingEvent<MerchStock>, ...options): SortingFunction<MerchStock> {
		return sortBy.key === "color"
			? sortingFunction<MerchStock>(obj => obj.color.name, sortBy.descending)
			: attributeSortingFunction(sortBy.key, sortBy.descending)
	}
}
