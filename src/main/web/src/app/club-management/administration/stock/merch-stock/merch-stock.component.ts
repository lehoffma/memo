import {Component, OnInit, Type} from "@angular/core";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {ColumnSortingEvent} from "../../../../shared/expandable-table/column-sorting-event";
import {Observable} from "rxjs/Observable";
import {attributeSortingFunction} from "../../../../util/util";
import {Merchandise} from "../../../../shop/shared/model/merchandise";
import {EventService} from "../../../../shared/services/api/event.service";
import {EventType} from "../../../../shop/shared/model/event-type";
import {ExpandableTableColumn} from "../../../../shared/expandable-table/expandable-table-column";
import {ExpandedRowComponent} from "../../../../shared/expandable-table/expanded-row.component";
import {MultiValueListExpandedRowComponent} from "../../../../shared/expandable-table/multi-value-list-expanded-row/multi-value-list-expanded-row.component";
import {NavigationService} from "../../../../shared/services/navigation.service";
import {ShopItemType} from "../../../../shop/shared/model/shop-item-type";
import {isNullOrUndefined} from "util";
import {StockService} from "../../../../shared/services/api/stock.service";
import {ActionPermissions} from "../../../../shared/expandable-table/expandable-table.component";
import {LogInService} from "../../../../shared/services/api/login.service";
import {StockTableItem} from "./stock-table-item";
import {MerchStockTableCellComponent} from "./merch-stock-table-cell.component";
import {TableActionEvent} from "../../../../shared/expandable-table/table-action-event";
import {MerchStock} from "../../../../shop/shared/model/merch-stock";
import {RowAction} from "../../../../shared/expandable-table/row-action";

@Component({
	selector: "memo-merch-stock",
	templateUrl: "./merch-stock.component.html",
	styleUrls: ["./merch-stock.component.scss"]
})
export class MerchStockComponent implements OnInit {
	_sortBy = new BehaviorSubject<ColumnSortingEvent<StockTableItem>>({
		key: "id",
		descending: false
	});
	sortBy: Observable<ColumnSortingEvent<StockTableItem>> = this._sortBy.asObservable();
	merchListSubject$: BehaviorSubject<any[]> = new BehaviorSubject([]);
	permissions$: Observable<ActionPermissions> = this.loginService.getActionPermissions("merch");
	primaryColumnKeys: BehaviorSubject<ExpandableTableColumn<any>[]> = new BehaviorSubject([]);
	expandedRowKeys: BehaviorSubject<ExpandableTableColumn<any>[]> = new BehaviorSubject([]);
	merchList: Observable<StockTableItem[]> = Observable.combineLatest(this.eventService.search("", EventType.merch)
			.do(this.updateRowsAndColumns.bind(this))
			.flatMap(this.stockService.mapToStockTableObject.bind(this.stockService))
		, this.sortBy)
		.map(([merch, sortBy]: [StockTableItem[], ColumnSortingEvent<StockTableItem>]) =>
			merch.sort(attributeSortingFunction(sortBy.key, sortBy.descending)));
	expandedRowComponent: Type<ExpandedRowComponent<any>> = MultiValueListExpandedRowComponent;

	constructor(private eventService: EventService,
				private loginService: LogInService,
				private stockService: StockService,
				private navigationService: NavigationService) {
		this.merchList.subscribe(merchList => this.merchListSubject$.next(merchList));
	}

	ngOnInit() {
	}


	/**
	 * Pushes a new sortBy value into the stream
	 * @param event
	 */
	updateSortingKey(event: ColumnSortingEvent<any>) {
		this._sortBy.next(event)
	}

	/**
	 *
	 * @param event
	 */
	addMerch(event: any) {
		this.navigationService.navigateByUrl("merch/create");
	}

	/**
	 *
	 * @param merchObj
	 */
	edit(merchObj: any) {
		if (!isNullOrUndefined(merchObj.id) && merchObj.id >= 0) {
			this.navigationService.navigateToItemWithId(ShopItemType.merch, merchObj.id, "/edit");
		}
	}

	/**
	 * @param merchObjects
	 */
	deleteMerch(merchObjects: any[]) {
		merchObjects.forEach(merchObject => this.eventService.remove(merchObject.id)
			.subscribe(
				value => {
					this.merchListSubject$.next(this.merchListSubject$.value
						.filter(object => merchObject.id !== object.id)
					);
				},
				error => console.error(error)
			));
	}

	/**
	 *
	 * @param {TableActionEvent<StockTableItem>} event
	 * @returns {any}
	 */
	handleMerchStockAction(event: TableActionEvent<StockTableItem>){
		switch(event.action){
			case RowAction.ADD:
				return this.addMerch(event);
			case RowAction.EDIT:
				return this.edit(event.entries[0]);
			case RowAction.DELETE:
				return this.deleteMerch(event.entries);
		}
	}

	/**
	 *
	 * @param {Merchandise[]} merchList
	 */
	updateRowsAndColumns(merchList: Merchandise[]){
		Observable.combineLatest(...merchList.map(merch => this.stockService.getByEventId(merch.id)))
			.first()
			.subscribe(stockList => {
				const options = this.stockService.getStockOptions(stockList);
				this.primaryColumnKeys.next([
					new ExpandableTableColumn<any>("Name", "title"),
					...options.size
						.map((size: string) => new ExpandableTableColumn<any>(size, size, MerchStockTableCellComponent)),
					new ExpandableTableColumn<any>("Gesamt", "total")
				]);
				this.expandedRowKeys.next([...options.color
					.map((color: string) => new ExpandableTableColumn<any>(color, color, MerchStockTableCellComponent))]);
			});
	}
}
