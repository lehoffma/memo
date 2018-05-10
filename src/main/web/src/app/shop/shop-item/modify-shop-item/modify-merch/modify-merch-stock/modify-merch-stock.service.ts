import {Injectable} from "@angular/core";
import {ExpandableTableContainerService} from "../../../../../shared/utility/material-table/util/expandable-table-container.service";
import {MerchStock} from "../../../../shared/model/merch-stock";
import {getId} from "../../../../../util/util";
import {LogInService} from "../../../../../shared/services/api/login.service";
import {ModifyMerchStockItemComponent} from "./modify-merch-stock-item/modify-merch-stock-item.component";
import {ModifyStockItemEvent} from "./modify-merch-stock-item/modify-stock-item-event";
import {ModifyType} from "../../modify-type";
import {MatDialog} from "@angular/material";
import {InMemoryDataService} from "../../../../../shared/utility/material-table/in-memory-data.service";

@Injectable()
export class ModifyMerchStockService extends ExpandableTableContainerService<MerchStock> {

	public dataSource: InMemoryDataService<MerchStock>;

	constructor(private loginService: LogInService,
				private matDialog: MatDialog) {
		super(loginService.getActionPermissions("stock"));

	}

	/**
	 *
	 * @param {ModifyStockItemEvent} event
	 */
	addStock(event: ModifyStockItemEvent) {
		Object.keys(event.sizes).forEach(size => {
			const index = this.dataSource.indexOfValues([event.color.name, size],
				t => t.color.name, t => t.size
			);

			//this stock item hasn't been added to the list yet
			if (index === -1) {
				this.dataSource.add({
					id: getId(size + event.color.name),
					item: event.event,
					size: size,
					color: Object.assign({}, event.color),
					amount: event.sizes[size]
				});
			}
			//the stock item is already part of the list => simply increase amount
			else {
				this.dataSource.modifyPartially({amount: this.dataSource.at(index).amount + event.sizes[size]},
					value => index);
			}
		});
	}

	/**
	 *
	 * @param {ModifyStockItemEvent} event
	 */
	editStock(event: ModifyStockItemEvent) {
		//todo multiple sizes

		const firstSize = Object.keys(event.sizes)[0];
		const newStock = {
			id: event.modifiedStock.id,
			item: event.event,
			size: firstSize,
			color: Object.assign({}, event.color),
			amount: event.sizes[firstSize]
		};

		this.dataSource.modify(newStock, value => this.dataSource.indexOf(value, it => it.id));
	}


	/**
	 * Ruft den modify dialog mit den gegebenen daten auf
	 * @param data
	 * @returns {Observable<any>}
	 */
	openModifyStockItemDialog(data: any = {}) {
		this.matDialog.open(ModifyMerchStockItemComponent, {data})
			.afterClosed()
			.subscribe((event: ModifyStockItemEvent) => {
				if (event) {
					switch (event.modifyType) {
						case ModifyType.ADD:
							this.addStock(event);
							break;
						case ModifyType.EDIT:
							this.editStock(event);
					}
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
			event: event.item,
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
		stockEntriesToDelete.forEach(entry => this.dataSource.remove(entry));
	}
}
