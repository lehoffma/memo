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
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import * as moment from "moment";
import {DateTableCellComponent} from "../administration/member-list/member-list-table-cells/date-table-cell.component";
import {LogInService} from "../../shared/services/login.service";
import {ActionPermissions} from "../../shared/expandable-table/expandable-table.component";
import {EntryCategoryCellComponent} from "./accounting-table-cells/entry-category-cell.component";
import {EventService} from "../../shared/services/event.service";

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

	entries$ = Observable.combineLatest(
		this.activatedRoute.paramMap,
		this.activatedRoute.queryParamMap,
		this.sortBy$
	)
		.flatMap(([paramMap, queryParamMap, sortBy]) =>
			this.getEntries([paramMap, queryParamMap, sortBy]))
		.map(entries => [...entries]);
	entriesSubject$: BehaviorSubject<Entry[]> = new BehaviorSubject([]);
	total$ = this.entriesSubject$
		.map(entries => entries.reduce((acc, entry) => acc + entry.value, 0));
	primaryColumnKeys: BehaviorSubject<ExpandableTableColumn<Entry>[]> = new BehaviorSubject([]);
	expandedRowKeys: BehaviorSubject<ExpandableTableColumn<Entry>[]> = new BehaviorSubject([]);
	expandedRowComponent: Type<ExpandedRowComponent<any>> = SingleValueListExpandedRowComponent;
	permissions$: Observable<ActionPermissions> = this.loginService.getActionPermissions("funds");
	showOptions = true;
	mobile = false;

	columns = {
		date: new ExpandableTableColumn<Entry>("Datum", "date", DateTableCellComponent),
		category: new ExpandableTableColumn<Entry>("Kostenart", "category", EntryCategoryCellComponent),
		name: new ExpandableTableColumn<Entry>("Name", "name"),
		value: new ExpandableTableColumn<Entry>("Kosten", "value", CostValueTableCellComponent)
	};

	constructor(private entryService: EntryService,
				private eventService: EventService,
				private activatedRoute: ActivatedRoute,
				private loginService: LogInService,
				private router: Router) {
		this.primaryColumnKeys.next([
			this.columns.date, this.columns.category, this.columns.name, this.columns.value
		]);

		this.entries$.subscribe(entries => this.entriesSubject$.next(entries));
		this.onResize({target: {innerWidth: window.innerWidth}});
	}

	ngOnInit() {
	}

	@HostListener("window:resize", ["$event"])
	onResize(event) {
		let mobile = event.target.innerWidth < 850;
		this.showOptions = !mobile;
		this.mobile = mobile;
		if (mobile) {
			this.primaryColumnKeys.next([
				this.columns.name, this.columns.value
			]);
			this.expandedRowKeys.next([this.columns.category, this.columns.date])
		}
		else {
			this.primaryColumnKeys.next([
				this.columns.date, this.columns.category, this.columns.name, this.columns.value
			]);
		}
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
		this.activatedRoute.queryParamMap
			.subscribe(queryParamMap => {
				const eventIds = queryParamMap.has("eventIds") ? queryParamMap.get("eventIds").split(",") : [];
				const queryParams = {};
				if (eventIds.length === 1) {
					queryParams["eventId"] = eventIds[0];
					this.eventService.getById(+eventIds[0])
						.subscribe(event => {
							queryParams["date"] = event.date.toISOString();
							this.router.navigate(["entries", "create"], {queryParams});
						})
				}
				else {
					this.router.navigate(["entries", "create"], {queryParams});
				}
			});
	}

	/**
	 *
	 * @param entryObj
	 */
	editEntry(entryObj: Entry) {

		this.activatedRoute.queryParamMap
			.subscribe(queryParamMap => {
				const eventIds = queryParamMap.has("eventIds") ? queryParamMap.get("eventIds").split(",") : [];
				const queryParams = {};
				if (eventIds.length === 1) {
					queryParams["eventId"] = eventIds[0];
				}

				if (!isNullOrUndefined(entryObj.id) && entryObj.id >= 0) {
					this.router.navigate(["entries", entryObj.id, "edit"], {queryParams});
				}
			});

	}

	/**
	 * @param entries
	 */
	deleteEntries(entries: Entry[]) {
		entries.forEach(merchObject => this.entryService.remove(merchObject.id)
			.subscribe(
				value => {
					this.entriesSubject$.next(this.entriesSubject$.value
						.filter(entry => !entries.some(deletedEntry => deletedEntry.id === entry.id)))
				},
				error => console.error(error)
			));
	}

	/**
	 *
	 * @param {Entry} entry
	 * @param queryParamMap
	 * @returns {boolean}
	 */
	entryMatchesFilterCriteria(entry: Entry, queryParamMap: ParamMap): boolean {
		let entryRemains = true;
		if (queryParamMap.has("eventTypes")) {
			//todo link entry to event somehow?
		}
		if (queryParamMap.has("costTypes")) {
			entryRemains = entryRemains && entry.categoryMatchesQueryParameter(queryParamMap.get("costTypes"));
		}

		return entryRemains;
	}

	/**
	 *
	 * @param {ParamMap} paramMap
	 * @param {ParamMap} queryParamMap
	 * @param {ColumnSortingEvent<any>} sortBy
	 * @returns {Observable<any>}
	 */
	getEntries([paramMap, queryParamMap, sortBy]: [ParamMap, ParamMap, ColumnSortingEvent<any>]): Observable<Entry[]> {
		let dateRange = this.extractDateRangeFromQueryParams(queryParamMap);

		//we're looking at an event's accounting table
		if (queryParamMap.has("eventIds")) {
			let eventIds: string[] = queryParamMap.get("eventIds")
				.split(",");

			return Observable.combineLatest(
				...eventIds.map(id => this.entryService.getEntriesOfEvent(+id))
			)
				.map((eventEntries: Entry[][]) => eventEntries.reduce((acc, current) => [...acc, ...current], []))
				.map(entries => entries
					.filter(entry => this.entryMatchesFilterCriteria(entry, queryParamMap))
					.sort(attributeSortingFunction(sortBy.key, sortBy.descending)))
				.defaultIfEmpty([]);
		}

		//otherwise, we're looking at the general club accounting table
		return this.entryService.search("", dateRange)
			.map(entries => entries
				.filter(entry => this.entryMatchesFilterCriteria(entry, queryParamMap))
				.sort(attributeSortingFunction(sortBy.key, sortBy.descending)))
			.defaultIfEmpty([]);
	}

	/**
	 * Extracts the dateRange from the queryParameters so it can be used in the API call
	 * @returns {{minDate: Date; maxDate: Date}}
	 */
	private extractDateRangeFromQueryParams(queryParamMap: ParamMap): { minDate: Date, maxDate: Date } {
		const from = queryParamMap.has("from") ? moment(queryParamMap.get("from")) : moment("1970-01-01");
		const to = queryParamMap.has("to") ? moment(queryParamMap.get("to")) : moment("2100-01-01");

		//default: this month
		return {
			minDate: from.toDate(),
			maxDate: to.toDate()
		};
	}
}
