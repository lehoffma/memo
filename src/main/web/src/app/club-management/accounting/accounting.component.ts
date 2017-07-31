import {Component, HostListener, OnInit, Type} from "@angular/core";
import {EntryService} from "../../shared/services/entry.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {ColumnSortingEvent} from "../../shared/expandable-table/column-sorting-event";
import {Entry} from "../../shared/model/entry";
import {Observable} from "rxjs/Observable";
import {attributeSortingFunction} from "../../util/util";
import {ExpandableTableColumn} from "../../shared/expandable-table/expandable-table-column";
import {SingleValueListExpandedRowComponent} from "../../shared/expandable-table/single-value-list-expanded-row/single-value-list-expanded-row.component";
import {ExpandedRowComponent} from "../../shared/expandable-table/expanded-row.component";
import {isNullOrUndefined} from "util";
import {CostValueTableCellComponent} from "./accounting-table-cells/cost-value-table-cell.component";
import {CostCategoryTableCellComponent} from "./accounting-table-cells/cost-category-table-cell.component";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {EventType} from "../../shop/shared/model/event-type";
import * as moment from "moment";

@Component({
	selector: "memo-accounting",
	templateUrl: "./accounting.component.html",
	styleUrls: ["./accounting.component.scss"]
})
export class AccountingComponent implements OnInit {
	_sortBy$ = new BehaviorSubject<ColumnSortingEvent<Entry>>({
		key: "id",
		descending: false
	});
	sortBy$: Observable<ColumnSortingEvent<Entry>> = this._sortBy$.asObservable();

	entries$ = Observable.combineLatest(this.activatedRoute.paramMap, this.activatedRoute.queryParamMap, this.sortBy$)
		.flatMap(([paramMap, queryParamMap, sortBy]) => this.getEntries([paramMap, queryParamMap, sortBy]));


	primaryColumnKeys: BehaviorSubject<ExpandableTableColumn<Entry>[]> = new BehaviorSubject([]);
	expandedRowKeys: BehaviorSubject<ExpandableTableColumn<Entry>[]> = new BehaviorSubject([]);

	expandedRowComponent: Type<ExpandedRowComponent<any>> = SingleValueListExpandedRowComponent;

	total$ = this.entries$
		.map(entries => entries.reduce((acc, entry) => acc + entry.value, 0));

	showOptions = true;
	mobile = false;

	constructor(private entryService: EntryService,
				private activatedRoute: ActivatedRoute,
				private router: Router) {
		this.primaryColumnKeys.next([
			new ExpandableTableColumn<Entry>("Kostenart", "category", CostCategoryTableCellComponent),
			new ExpandableTableColumn<Entry>("Name", "name"),
			new ExpandableTableColumn<Entry>("Kosten", "value", CostValueTableCellComponent),
		]);


		let mobile = window.innerWidth < 850;
		this.showOptions = !mobile;
		this.mobile = mobile;
	}

	ngOnInit() {
	}

	@HostListener("window:resize", ["$event"])
	onResize(event) {
		let mobile = event.target.innerWidth < 850;
		this.showOptions = !mobile;
		this.mobile = mobile;
	}


	/**
	 * Pushes a new sortBy value into the stream
	 * @param event
	 */
	updateSortingKey(event: ColumnSortingEvent<Entry>) {
		this._sortBy$.next(event)
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

	/**
	 * Extracts the dateRange from the queryParameters so it can be used in the API call
	 * @returns {{minDate: Date; maxDate: Date}}
	 */
	private extractDateRangeFromQueryParams(queryParamMap: ParamMap): { minDate: Date, maxDate: Date } {
		//default: this month
		let dateRange: { minDate: Date, maxDate: Date } = {
			minDate: moment().startOf("month").toDate(),
			maxDate: moment().endOf("month").toDate()
		};
		//if the user specified anything, use these values instead
		if (queryParamMap.has("from") && queryParamMap.has("to")) {
			let from = moment(queryParamMap.get("from"));
			let to = moment(queryParamMap.get("to"));
			//swap them if their order is incorrect
			if (from.isAfter(to)) {
				[to, from] = [from, to];
			}
			dateRange = {
				minDate: from.toDate(),
				maxDate: to.toDate()
			};
		}
		return dateRange;
	}

	/**
	 *
	 * @param {ParamMap} paramMap
	 * @param {ParamMap} queryParamMap
	 * @param {ColumnSortingEvent<any>} sortBy
	 * @returns {Observable<any>}
	 */
	getEntries([paramMap, queryParamMap, sortBy]: [ParamMap, ParamMap, ColumnSortingEvent<any>]): Observable<Entry[]> {
		//we're looking at an event's accounting table
		if (paramMap.has("itemType") && paramMap.has("eventId")) {
			let itemType: EventType = EventType[paramMap.get("itemType")];
			let eventId = +paramMap.get("eventId");
			return this.entryService.getEntriesOfEvent(eventId, itemType)
				.map(entries => entries.sort(attributeSortingFunction(sortBy.key, sortBy.descending)));
		}

		//otherwise, we're looking at the general club accounting table
		let dateRange = this.extractDateRangeFromQueryParams(queryParamMap);

		return this.entryService.search("", dateRange)
			.map(entries => entries
				.filter(entry => {
					let entryRemains = true;
					if (queryParamMap.has("eventTypes")) {
						//todo link entry to event somehow
					}
					if (queryParamMap.has("costTypes")) {
						entryRemains = entryRemains && entry.categoryMatchesQueryParameter(queryParamMap.get("costTypes"));
					}

					return entryRemains;
				})
				.sort(attributeSortingFunction(sortBy.key, sortBy.descending)));
	}
}
