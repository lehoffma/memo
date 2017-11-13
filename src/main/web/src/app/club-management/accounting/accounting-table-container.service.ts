import {Injectable, OnDestroy} from '@angular/core';
import {ExpandableTableContainerService} from "../../shared/expandable-table/expandable-table-container.service";
import {Entry} from "../../shared/model/entry";
import {ColumnSortingEvent} from "../../shared/expandable-table/column-sorting-event";
import {LogInService} from "../../shared/services/api/login.service";
import {ParamMap, Router} from "@angular/router";
import {EntryService} from "../../shared/services/api/entry.service";
import * as moment from "moment";
import {Moment} from "moment";
import {attributeSortingFunction, dateSortingFunction, SortingFunction, sortingFunction} from "../../util/util";
import {isNullOrUndefined} from "util";
import {EventService} from "../../shared/services/api/event.service";
import {Dimension, WindowService} from "../../shared/services/window.service";
import {ExpandableTableColumn} from "../../shared/expandable-table/expandable-table-column";
import {DateTableCellComponent} from "../administration/member-list/member-list-table-cells/date-table-cell.component";
import {EntryCategoryCellComponent} from "./accounting-table-cells/entry-category-cell.component";
import {CostValueTableCellComponent} from "./accounting-table-cells/cost-value-table-cell.component";
import {NavigationService} from "../../shared/services/navigation.service";
import {Observable} from "rxjs/Observable";
import {catchError, defaultIfEmpty, first, map, mergeMap, tap} from "rxjs/operators";
import {combineLatest} from "rxjs/observable/combineLatest";
import {empty} from "rxjs/observable/empty";
import {of} from "rxjs/observable/of";

@Injectable()
export class AccountingTableContainerService extends ExpandableTableContainerService<Entry>{

	columns = {
		date: new ExpandableTableColumn<Entry>("Datum", "date", DateTableCellComponent),
		category: new ExpandableTableColumn<Entry>("Kostenart", "category", EntryCategoryCellComponent),
		name: new ExpandableTableColumn<Entry>("Name", "name"),
		value: new ExpandableTableColumn<Entry>("Kosten", "value", CostValueTableCellComponent)
	};

	subscriptions = [];
	constructor(protected loginService: LogInService,
				protected router: Router,
				protected navigationService: NavigationService,
				protected eventService: EventService,
				protected windowService: WindowService,
				protected entryService: EntryService) {
		super({
				key: "id",
				descending: false
			},
			loginService.getActionPermissions("funds"),
			[navigationService.queryParamMap$],
		);

		this.init(this.getDataSource$());

		this.subscriptions.push(this.windowService.dimension$
			.subscribe(dimensions => this.onResize(dimensions)));
	}

	ngOnDestroy(){
		super.ngOnDestroy();
		this.subscriptions.forEach(it => it.unsubscribe());
	}

	/**
	 * Updates the columns and way the options are presented depending on the given width/height object
	 * @param {Dimension} dimension the current window dimensions
	 */
	onResize(dimension: Dimension) {
		let mobile = dimension.width < 850;
		if (mobile) {
			this.primaryColumnKeys$.next([
				this.columns.name, this.columns.value
			]);
			this.expandedRowKeys$.next([this.columns.category, this.columns.date])
		}
		else {
			this.primaryColumnKeys$.next([
				this.columns.date, this.columns.category, this.columns.name, this.columns.value
			]);
		}
	}

	/**
	 * Extracts the dateRange from the queryParameters so it can be used in the API call
	 * @returns {{minDate: Date; maxDate: Date}}
	 */
	private extractDateRangeFromQueryParams(queryParamMap: ParamMap): { minDate: Moment, maxDate: Moment } {
		const from = queryParamMap.has("from") ? moment(queryParamMap.get("from")) : moment("1970-01-01");
		const to = queryParamMap.has("to") ? moment(queryParamMap.get("to")) : moment("2100-01-01");

		//default: this month
		return {
			minDate: from,
			maxDate: to
		};
	}


	getDataSource$(): Observable<Entry[]> {
		return this.navigationService.queryParamMap$
			.pipe(
				mergeMap(queryParamMap => {
					const dateRange = this.extractDateRangeFromQueryParams(queryParamMap);

					//we're looking at an event's accounting table
					if (queryParamMap.has("eventIds")) {
						let eventIds: string[] = queryParamMap.getAll("eventIds");

						return combineLatest(
							...eventIds.map(id => this.entryService.getEntriesOfEvent(+id)
								.pipe(defaultIfEmpty([]))
							)
						)
							.pipe(
								map(eventEntries =>
									eventEntries.reduce((acc, current) => [...acc, ...current], []))
							);
					}

					//otherwise, we're looking at the general club accounting table
					return this.entryService.search("", dateRange)
						.pipe(
							defaultIfEmpty([])
						);
				}),
				catchError(error => {
					console.error(error);
					return empty<Entry[]>()
				}),
				defaultIfEmpty([])
			);

	}

	/**
	 * Extracts the first eventId from the given query parameters map and returns a new queryParam Object
	 * containing the eventId and an ISO-formatted date string (if the map contained just one id,
	 * otherwise the object is empty).
	 * @param {ParamMap} queryParamMap
	 * @returns {Observable<{}>}
	 */
	getQueryParamsForEntryModification(queryParamMap: ParamMap) {
		//extract eventIds from the query parameters, if they are any
		const eventIds = queryParamMap.has("eventIds") ? queryParamMap.get("eventIds").split(",") : [];
		const queryParams = {};
		if (eventIds.length === 1) {
			queryParams["eventId"] = eventIds[0];
			return this.eventService.getById(+eventIds[0])
				.pipe(
					map(event => {
						queryParams["date"] = event.date.toISOString();
						return queryParams;
					})
				)
		}
		return of(queryParams);
	}

	/**
	 * Redirects the user to the "create entry" page. If the user was looking at an event's costs, the query params
	 * will be set so that the created entry will automatically be associated with the event.
	 */
	add() {
		this.navigationService.queryParamMap$
			.pipe(
				first(),
				mergeMap(this.getQueryParamsForEntryModification)
			)
			.subscribe(queryParams => {
				this.router.navigate(["entries", "create"], {queryParams});
			});
	}

	/**
	 * Redirects the user to the "modify entry" page. If the user was looking at an event's costs, the query params
	 * will be set so that the created entry will automatically be associated with the event.
	 * @param entryObj
	 */
	edit(entryObj: Entry) {
		this.navigationService.queryParamMap$
			.pipe(
				first(),
				mergeMap(this.getQueryParamsForEntryModification)
			)
			.subscribe(queryParams => {
				if (!isNullOrUndefined(entryObj.id) && entryObj.id >= 0) {
					this.router.navigate(["entries", entryObj.id, "edit"], {queryParams});
				}
			});

	}

	/**
	 * Calls the remove Http request of the entryService and, if successful, removes the entry from the internal subject too.
	 * @param entries
	 */
	remove(entries: Entry[]) {
		entries.forEach(merchObject => this.entryService.remove(merchObject.id)
			.pipe(
				map(() => this.dataSubject$.value
					.filter(entry => !entries.some(deletedEntry => deletedEntry.id === entry.id)))
			)
			.subscribe(this.dataSubject$));
	}

	satisfiesFilter(entry: Entry, queryParamMap: ParamMap): boolean {
		let entryRemains = true;
		if (queryParamMap.has("eventIds")) {
			entryRemains = entryRemains && queryParamMap.getAll("eventIds").some(id => entry.event.id === +id);
		}
		if (queryParamMap.has("costTypes")) {
			entryRemains = entryRemains && queryParamMap.getAll("costTypes")
				.some(type => type.toLowerCase() === entry.category.name.toLowerCase());
		}

		return entryRemains;
	}

	comparator(sortBy: ColumnSortingEvent<Entry>, ...options): SortingFunction<Entry> {
		if (sortBy.key === "category") {
			return sortingFunction<Entry>(entry => entry.category.name, sortBy.descending);
		}
		if (sortBy.key === "date") {
			return dateSortingFunction<Entry>(entry => entry.date, sortBy.descending);
		}
		return attributeSortingFunction(sortBy.key, sortBy.descending);
	}
}
