import {Component, OnInit, Type} from "@angular/core";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {ColumnSortingEvent} from "../../../../shared/expandable-table/column-sorting-event";
import {Observable} from "rxjs/Observable";
import {attributeSortingFunction} from "../../../../util/util";
import {Merchandise} from "../../../../shop/shared/model/merchandise";
import {EventService} from "../../../../shared/services/event.service";
import {EventType} from "../../../../shop/shared/model/event-type";
import {ExpandableTableColumn} from "../../../../shared/expandable-table/expandable-table-column";
import {ExpandedRowComponent} from "../../../../shared/expandable-table/expanded-row.component";
import {MultiValueListExpandedRowComponent} from "../../../../shared/expandable-table/multi-value-list-expanded-row/multi-value-list-expanded-row.component";
import {MerchStockTotalTableCellComponent} from "app/club-management/administration/stock/merch-stock/merch-stock-table-cells/merch-stock-total-table-cell.component";
import {NavigationService} from "../../../../shared/services/navigation.service";
import {ShopItemType} from "../../../../shop/shared/model/shop-item-type";
import {isNullOrUndefined} from "util";

@Component({
	selector: "memo-merch-stock",
	templateUrl: "./merch-stock.component.html",
	styleUrls: ["./merch-stock.component.scss"]
})
export class MerchStockComponent implements OnInit {

	_sortBy = new BehaviorSubject<ColumnSortingEvent<Merchandise>>({
		key: "id",
		descending: false
	});
	sortBy: Observable<ColumnSortingEvent<Merchandise>> = this._sortBy.asObservable();

	merchList: Observable<any[]> = Observable.combineLatest(this.eventService.search("", {eventType: EventType.merch})
			.do((merchList: Merchandise[]) => {
				let options = Merchandise.getStockOptions(merchList);

				this.primaryColumnKeys.next([
					new ExpandableTableColumn<any>("Name", "title"),
					...options.size
						.map((size: string) => new ExpandableTableColumn<any>(size, size, MerchStockTotalTableCellComponent)),
					new ExpandableTableColumn<any>("Gesamt", "total")
				]);
				this.expandedRowKeys.next([...options.color
					.map((color: string) => new ExpandableTableColumn<any>(color, color))]);
			})
			.map((merchList: Merchandise[]) => Merchandise.mapToStockObject(merchList))
		, this.sortBy)
		.map(([merch, sortBy]) => merch.sort(attributeSortingFunction(sortBy.key, sortBy.descending)));

	primaryColumnKeys: BehaviorSubject<ExpandableTableColumn<any>[]> = new BehaviorSubject([]);
	expandedRowKeys: BehaviorSubject<ExpandableTableColumn<any>[]> = new BehaviorSubject([]);

	expandedRowComponent: Type<ExpandedRowComponent<any>> = MultiValueListExpandedRowComponent;

	constructor(private eventService: EventService,
				private navigationService: NavigationService) {
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
		merchObjects.forEach(merchObject => this.eventService.remove(merchObject.id, {eventType: EventType.merch})
			.subscribe(
				value => value,
				error => console.error(error)
			));
	}

}
