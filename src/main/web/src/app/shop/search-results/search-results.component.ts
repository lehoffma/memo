import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {EventService} from "../../shared/services/api/event.service";
import {Event} from "../shared/model/event";
import {SortingOption} from "../../shared/model/sorting-option";
import {eventSortingOptions} from "./sorting-options";
import {MultiLevelSelectParent} from "app/shared/utility/multi-level-select/shared/multi-level-select-parent";
import {SearchFilterService} from "./search-filter.service";
import {FilterOptionBuilder} from "./filter-option-builder.service";
import {FilterOptionType} from "./filter-option-type";
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {debounceTime, defaultIfEmpty, distinctUntilChanged, filter, map, mergeMap, scan, takeUntil} from "rxjs/operators";
import {Filter} from "../../shared/model/api/filter";
import {Sort} from "../../shared/model/api/sort";
import {PageRequest} from "../../shared/model/api/page-request";
import {NOW} from "../../util/util";
import {Page} from "../../shared/model/api/page";
import {MatDialog} from "@angular/material";
import {LogInService} from "../../shared/services/api/login.service";
import {Permission, visitorPermissions} from "../../shared/model/permission";
import {isNullOrUndefined} from "util";
import {userPermissions} from "../../shared/model/user";
import {CreateEventContextMenuComponent} from "../event-calendar-container/create-event-context-menu/create-event-context-menu.component";
import {getAllQueryValues} from "../../shared/model/util/url-util";
import {ManualPagedDataSource} from "../../shared/utility/material-table/manual-paged-data-source";

type SortingQueryParameter = { sortedBy: string; descending: string; };

@Component({
	selector: "memo-search-results",
	templateUrl: "./search-results.component.html",
	styleUrls: ["./search-results.component.scss"]
})
export class SearchResultComponent implements OnInit, OnDestroy {
	private readonly PAGE_SIZE = 20;

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
				? Sort.by(paramMap.get("direction"), getAllQueryValues(paramMap, "sortBy").join(","))
				: Sort.none())
		);
	filter$: Observable<Filter> = this.activatedRoute.queryParamMap
		.pipe(
			map(paramMap => {
				let paramObject = {};
				paramMap.keys
					.filter(it => !["page", "pageSize", "sortBy", "direction"].includes(it))
					.forEach(key => {
						let value = getAllQueryValues(paramMap, key).join(",");
						if (key.toLowerCase() === "date") {
							if (value === "past") {
								key = "maxDate";
							} else if (value === "upcoming") {
								key = "minDate";
							}
							value = NOW.toISOString();
						}
						paramObject[key] = value;
					});
				return Filter.by(paramObject);
			}),
			distinctUntilChanged((x, y) => Filter.equal(x, y))
		);

	page$ = new BehaviorSubject(PageRequest.first(this.PAGE_SIZE));

	//results data handling
	resultsDataSource: ManualPagedDataSource<Event> = new ManualPagedDataSource<Event>(this.eventService, this.page$);
	canLoadMore$ = this.resultsDataSource.currentPage$.pipe(
		map((it: Page<Event>) => !it.last)
	);

	//todo store current state in localstorage or something?
	currentResults$ = new BehaviorSubject<Event[]>([]);
	results$;

	resultsTitle: BehaviorSubject<string> = new BehaviorSubject("");
	sortingOptions: SortingOption<Event>[] = eventSortingOptions;

	onDestroy$: Subject<any> = new Subject<any>();

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
				private router: Router,
				private eventService: EventService) {
		this.resultsDataSource.isExpandable = false;
		this.resultsDataSource.filter$ = this.filter$;
		this.resultsDataSource.sort$ = this.sortedBy;
		this.init();
		this.initResults();
		this.resultsDataSource.resetPageAndUpdateOnFilter(
			() => {
				this.currentResults$.next(null);
				this.page$.next(PageRequest.first(this.page$.getValue().pageSize));
			}
		);
	}

	get filterOptions() {
		return this._filterOptions$.getValue();
	}

	set filterOptions(options: MultiLevelSelectParent[]) {
		this._filterOptions$.next(options);
	}

	ngOnInit() {
	}


	ngOnDestroy() {
		this.onDestroy$.next();
		this.onDestroy$.complete();
		this.resultsDataSource.disconnect(null);
	}

	private updateCurrentResults(results: Event[]) {
		const currentValue = this.currentResults$.getValue() || [];
		const newValue = [...currentValue, ...results]
			.filter((value, i, array) => array.findIndex(it => it.id === value.id) === i);
		this.currentResults$.next(newValue);
	}

	private updateResultsTitle(results: Event[]) {
		const amount = this.resultsDataSource.currentPage$.getValue().totalElements;
		this.resultsTitle.next(results.length + " von " + amount + " Ergebnissen");
	}

	private buildFilterOptions(filter: Filter) {
		return this.filterOptionBuilder
			.empty()
			.withOptions(
				FilterOptionType.EVENT_CATEGORY,
				FilterOptionType.DATE,
				FilterOptionType.PRICE,
				FilterOptionType.COLOR,
				FilterOptionType.MATERIAL,
				FilterOptionType.SIZE
			)
			.build(filter);
	}

	private init() {
		//initialize filter menu
		this.filter$.pipe(
			mergeMap(filter => this.buildFilterOptions(filter)),
			map(options => this.searchFilterService.initFilterMenu(this.activatedRoute, options)),
			takeUntil(this.onDestroy$),
		).subscribe(this._filterOptions$);
	}

	private initResults() {
		this.results$ = this.resultsDataSource.connect();
		this.results$.pipe(
			takeUntil(this.onDestroy$)
		).subscribe(results => {
			this.updateCurrentResults(results);
			this.updateResultsTitle(this.currentResults$.getValue());
		});
		this.updateResultsTitle(this.currentResults$.getValue());
	}

	loadMore() {
		const currentValue = this.page$.getValue();
		this.page$.next(PageRequest.at(currentValue.page + 1, currentValue.pageSize));
		this.resultsDataSource.update();
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
