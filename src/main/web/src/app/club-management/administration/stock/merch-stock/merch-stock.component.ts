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
			.map((merchList: Merchandise[]) => {
				let options = this.getOptions(merchList);

				this.primaryColumnKeys.next([
					new ExpandableTableColumn<any>("Name", "title"),
					...options.size
						.map((size: string) => new ExpandableTableColumn<any>(size, size, MerchStockTotalTableCellComponent)),
					new ExpandableTableColumn<any>("Gesamt", "total")
				]);
				this.expandedRowKeys.next([...options.color
					.map((color: string) => new ExpandableTableColumn<any>(color, color))]);

				return merchList.map(merchObject => {
					let transformedMerch: any = {id: merchObject.id};
					options.size.forEach(size => {
						transformedMerch[size] = this.getStockAmountList(merchObject, options, "size", "color", size);
					});
					options.color.forEach(color => {
						transformedMerch[color] = this.getStockAmountList(merchObject, options, "color", "size", color);
					});
					transformedMerch["title"] = merchObject.title;
					transformedMerch["total"] = options.size.reduce(
						(acc, size) => acc + transformedMerch[size][transformedMerch[size].length - 1]
						, 0
					);

					return transformedMerch;
				})
			})
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


	/**
	 *
	 * @param merchList
	 * @returns {{size: Array, color: Array}}
	 */
	getOptions(merchList: Merchandise[]) {
		return {
			size: merchList.reduce((sizes, current) => {
				current.stock
					.forEach(stock => {
						if (!sizes.includes(stock.size)) {
							sizes.push(stock.size);
						}
					});
				return sizes;
			}, []),
			color: merchList.reduce((colors, current) => {
				current.stock
					.forEach(stock => {
						if (!colors.find(color => color === stock.color.name)) {
							colors.push(stock.color.name);
						}
					});
				return colors;
			}, [])
		};
	}

	/**
	 *
	 * @param merch
	 * @param options
	 * @param stockKey
	 * @param optionsKey
	 * @param stockValue
	 * @returns {Array}
	 */
	getStockAmountList(merch: Merchandise, options: { [key: string]: string[] }, stockKey: string, optionsKey: string, stockValue: string) {
		let list = merch.stock
			.filter(stock => stock[stockKey] === stockValue || stock[stockKey].name === stockValue)
			.reduce((acc, stock) => {
				let index = options[optionsKey].findIndex(option =>
					option === stock[optionsKey] || option === stock[optionsKey].name
				);
				acc[index] = stock.amount;
				return acc;
			}, []);

		list.push(list.reduce((acc, val) => acc + val, 0));

		return list;
	};

}
