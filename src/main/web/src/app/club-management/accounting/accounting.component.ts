import {Component, OnInit, Type} from "@angular/core";
import {EntryService} from "../../shared/services/entry.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {ColumnSortingEvent} from "../../shared/expandable-table/column-sorting-event";
import {Entry} from "../../shared/model/entry";
import {Observable} from "rxjs/Observable";
import {attributeSortingFunction} from "../../util/util";
import {ExpandableTableColumn} from "../../shared/expandable-table/expandable-table-column";
import {SingleValueListExpandedRowComponent} from "../../shared/expandable-table/single-value-list-expanded-row/single-value-list-expanded-row.component";
import {ExpandedRowComponent} from "../../shared/expandable-table/expanded-row.component";
import {NavigationService} from "../../shared/services/navigation.service";
import {isNullOrUndefined} from "util";
import {CostValueTableCellComponent} from "./accounting-table-cells/cost-value-table-cell.component";
import {CostCategoryTableCellComponent} from "./accounting-table-cells/cost-category-table-cell.component";
import {ActivatedRoute, Router} from "@angular/router";
import {EventType} from "../../shop/shared/model/event-type";

@Component({
	selector: "memo-accounting",
	templateUrl: "./accounting.component.html",
	styleUrls: ["./accounting.component.scss"]
})
export class AccountingComponent implements OnInit {
	_sortBy = new BehaviorSubject<ColumnSortingEvent<Entry>>({
		key: "id",
		descending: false
	});
	sortBy: Observable<ColumnSortingEvent<Entry>> = this._sortBy.asObservable();

	entries = Observable.combineLatest(this.activatedRoute.paramMap
		.flatMap(paramMap => {
			if (paramMap.has("itemType") && paramMap.has("eventId")) {
				let itemType: EventType = EventType[paramMap.get("itemType")];
				let eventId = +paramMap.get("eventId");
				return this.entryService.getEntriesOfEvent(eventId, itemType);
			}
			return this.entryService.search("");
		}), this.sortBy)
		.map(([entries, sortBy]) => entries.sort(attributeSortingFunction(sortBy.key, sortBy.descending)));

	primaryColumnKeys: BehaviorSubject<ExpandableTableColumn<Entry>[]> = new BehaviorSubject([]);
	expandedRowKeys: BehaviorSubject<ExpandableTableColumn<Entry>[]> = new BehaviorSubject([]);

	expandedRowComponent: Type<ExpandedRowComponent<any>> = SingleValueListExpandedRowComponent;

	//todo filter menu options: date (range), cost category, ...?

	constructor(private entryService: EntryService,
				private activatedRoute: ActivatedRoute,
				private router: Router,
				private navigationService: NavigationService) {
		this.primaryColumnKeys.next([
			new ExpandableTableColumn<Entry>("Kostenart", "category", CostCategoryTableCellComponent),
			new ExpandableTableColumn<Entry>("Name", "name"),
			new ExpandableTableColumn<Entry>("Kosten", "value", CostValueTableCellComponent),
		])
		//todo expandedRowKeys are not really needed are they?
	}

	ngOnInit() {
	}


	/**
	 * Pushes a new sortBy value into the stream
	 * @param event
	 */
	updateSortingKey(event: ColumnSortingEvent<Entry>) {
		this._sortBy.next(event)
	}


	/**
	 *
	 * @param event
	 */
	addEntry(event: any) {
		this.activatedRoute.paramMap
			.first()
			.subscribe(paramMap => {
				if (paramMap.has("itemType") && paramMap.has("eventId")) {
					this.router.navigate(["create"], {relativeTo: this.activatedRoute});
					return;
				}
				this.router.navigate(["entries", "create"]);
			});
	}

	/**
	 *
	 * @param entryObj
	 */
	editEntry(entryObj: Entry) {
		if (!isNullOrUndefined(entryObj.id) && entryObj.id >= 0) {
			this.activatedRoute.paramMap
				.first()
				.subscribe(paramMap => {
					if (paramMap.has("itemType") && paramMap.has("eventId")) {
						this.router.navigate([entryObj.id, "edit"], {relativeTo: this.activatedRoute});
						return;
					}
					this.router.navigate(["entries", entryObj.id, "edit"]);
				});
		}
	}

	/**
	 * @param entries
	 */
	deleteEntries(entries: Entry[]) {
		entries.forEach(merchObject => this.entryService.remove(merchObject.id)
			.subscribe(
				value => value,
				error => console.error(error)
			));
	}


}
