import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {EventService} from "../../shared/services/api/event.service";
import {Event} from "../shared/model/event";
import {SortingOption} from "../../shared/model/sorting-option";
import {eventSortingOptions} from "./sorting-options";
import {MultiLevelSelectParent} from "app/shared/utility/multi-level-select/shared/multi-level-select-parent";
import {isMultiLevelSelectLeaf} from "../../shared/utility/multi-level-select/shared/multi-level-select-option";
import {SearchFilterService} from "./search-filter.service";
import {FilterOptionBuilder} from "./filter-option-builder.service";
import {FilterOptionType} from "./filter-option-type";
import {BehaviorSubject, combineLatest, Observable, Subscription} from "rxjs";
import {debounceTime, defaultIfEmpty, filter, map, mergeMap, scan, tap} from "rxjs/operators";
import {Filter} from "../../shared/model/api/filter";
import {Sort} from "../../shared/model/api/sort";
import {PageRequest} from "../../shared/model/api/page-request";
import {NOW} from "../../util/util";
import {PageResponse} from "../../shared/model/api/page";
import {MatDialog, PageEvent} from "@angular/material";
import {LogInService} from "../../shared/services/api/login.service";
import {Permission, visitorPermissions} from "../../shared/model/permission";
import {isNullOrUndefined} from "util";
import {userPermissions} from "../../shared/model/user";
import {CreateEventContextMenuComponent} from "../event-calendar-container/create-event-context-menu/create-event-context-menu.component";

type SortingQueryParameter = { sortedBy: string; descending: string; };

@Component({
	selector: "memo-search-results",
	templateUrl: "./search-results.component.html",
	styleUrls: ["./search-results.component.scss"]
})
export class SearchResultComponent implements OnInit, OnDestroy {
	userCanAddItem$: Observable<boolean> = this.loginService.getActionPermissions("merch", "tour", "party")
		.pipe(
			map(permission => permission.Hinzufuegen)
		);

	keywords: Observable<string> = this.activatedRoute.queryParamMap
		.pipe(
			map(paramMap => paramMap.has("searchTerm")
				? paramMap.get("searchTerm")
				: "")
		);
	sortedBy: Observable<Sort> = this.activatedRoute.queryParamMap
		.pipe(
			map(paramMap => paramMap.has("sortBy") && paramMap.has("direction")
				? Sort.by(paramMap.get("direction"), paramMap.getAll("sortBy").join("|"))
				: Sort.none())
		);
	filteredBy: Observable<Filter> = this.activatedRoute.queryParamMap
		.pipe(
			map(paramMap => {
				let paramObject = {};
				paramMap.keys
					.forEach(key => {
						let value = paramMap.getAll(key).join("|");
						if (key.toLowerCase() === "date") {
							if (value === "past") {
								key = "maxDate";
							}
							else if (value === "upcoming") {
								key = "minDate";
							}
							value = NOW.toISOString();
						}
						paramObject[key] = value;
					});
				return Filter.by(paramObject);
			})
		);

	page$ = new BehaviorSubject(PageRequest.first());
	currentPage$ = new BehaviorSubject(PageResponse.empty());

	resultsTitle: BehaviorSubject<string> = new BehaviorSubject("");
	sortingOptions: SortingOption<Event>[] = eventSortingOptions;
	subscription: Subscription;
	resultSubscription: Subscription;

	private _filterOptions$ = new BehaviorSubject<MultiLevelSelectParent[]>([]);
	filterOptions$ = this._filterOptions$
		.asObservable()
		.pipe(
			debounceTime(200),
			scan(this.searchFilterService.mergeFilterOptions.bind(this.searchFilterService)),
			map(options => options.filter(option => option.children && option.children.length > 0))
		);

	constructor(private activatedRoute: ActivatedRoute,
				private searchFilterService: SearchFilterService,
				private matDialog: MatDialog,
				private filterOptionBuilder: FilterOptionBuilder,
				private loginService: LogInService,
				private eventService: EventService) {
		this.fetchResults();
	}

	get filterOptions() {
		return this._filterOptions$.getValue();
	}

	set filterOptions(options) {
		this._filterOptions$.next(options);
	}

	results$: BehaviorSubject<Event[]> = new BehaviorSubject<Event[]>([]);

	ngOnInit() {
	}


	ngOnDestroy() {
		if (this.subscription) {
			this.subscription.unsubscribe();
		}
		if (this.resultSubscription) {
			this.resultSubscription.unsubscribe();
		}
	}

	private fetchResults() {
		this.resultSubscription = combineLatest(this.sortedBy, this.page$, this.filteredBy)
			.pipe(
				tap(it => this.results$.next(null)),
				//reset results so the result screen can show a loading screen while the http call is performed
				// tap(() => this.results$ = empty()),
				tap(([sortedBy, pageRequest, filteredBy]) =>
					this.subscription = this.filterOptionBuilder
						.empty()
						.withOptions(
							FilterOptionType.EVENT_CATEGORY,
							FilterOptionType.DATE,
							FilterOptionType.PRICE,
							FilterOptionType.COLOR,
							FilterOptionType.MATERIAL,
							FilterOptionType.SIZE
						)
						.build(filteredBy)
						.pipe(
							mergeMap(options => this.searchFilterService.initFilterMenu(this.activatedRoute, options)),
							tap(filterOptions => this.filterOptions = filterOptions)
						)
						.subscribe()
				),
				mergeMap(([sortedBy, pageRequest, filteredBy]) => this.eventService.get(
					filteredBy,
					pageRequest,
					sortedBy,
				)),
				tap(it => this.currentPage$.next(it)),
				map(it => it.content),
				tap(events => {
					let categoryFilterOption = this.filterOptions.find(option => option.name === "Kategorie");
					let selectedCategories: string[] = categoryFilterOption.children
						.filter(child => isMultiLevelSelectLeaf(child) ? child.selected : false)
						.map(child => child.name);

					//todo ausgewählte filter optionen in den title reintun
					this.resultsTitle.next(events.length + " " + selectedCategories.join(", ") +
						" Ergebnisse");
				}),
				tap(it => this.results$.next(it))
			)
			.subscribe();
	}


	updatePage(pageEvent: PageEvent) {
		this.page$.next(PageRequest.fromMaterialPageEvent(pageEvent));
	}

	openCreateDialog() {
		const permissions$ = this.loginService.currentUser$
			.pipe(
				filter(user => user !== null),
				map(user => userPermissions(user)),
				filter(permissions => !isNullOrUndefined(permissions)),
				defaultIfEmpty(visitorPermissions)
			);

		const dialogRef = this.matDialog.open(CreateEventContextMenuComponent, {
			autoFocus: false,
			data: {
				date: new Date(),
				tours: permissions$
					.pipe(map(permissions => permissions.tour >= Permission.create)),
				partys: permissions$
					.pipe(map(permissions => permissions.party >= Permission.create)),
				merch: permissions$
					.pipe(map(permissions => permissions.merch >= Permission.create)),
				show: {tours: true, partys: true, merch: true}
			}
		});

		dialogRef.afterClosed()
			.subscribe(console.log, console.error)
	}

}
