import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {EventService} from "../../shared/services/api/event.service";
import {Event} from "../shared/model/event";
import {SortingOption} from "../../shared/model/sorting-option";
import {eventSortingOptions} from "../../shared/search/sorting-options";
import {MultiLevelSelectParent} from "app/shared/utility/multi-level-select/shared/multi-level-select-parent";
import {SearchFilterService} from "../../shared/search/search-filter.service";
import {FilterOptionBuilder} from "../../shared/search/filter-option-builder.service";
import {FilterOptionType} from "../../shared/search/filter-option-type";
import {BehaviorSubject, combineLatest, Observable, Subject} from "rxjs";
import {
	debounceTime,
	defaultIfEmpty,
	distinctUntilChanged,
	filter,
	first,
	map,
	scan, skip,
	startWith,
	switchMap,
	takeUntil
} from "rxjs/operators";
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
import {FilterOptionFactoryService} from "../../shared/search/filter-option-factory.service";
import {QueryParameterService} from "../../shared/services/query-parameter.service";
import {PagedDataSource} from "../../shared/utility/material-table/paged-data-source";

@Component({
	selector: "memo-search-results",
	templateUrl: "./search-results.component.html",
	styleUrls: ["./search-results.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchResultComponent implements OnInit, OnDestroy {
	private readonly PAGE_SIZE = 20;

	userCanAddItem$: Observable<boolean> = this.loginService.getActionPermissions("merch", "tour", "party")
		.pipe(
			map(permission => permission.Hinzufuegen)
		);
	sortedBy: Observable<Sort> = this.activatedRoute.queryParamMap
		.pipe(
			map(paramMap => paramMap.has("sortBy") && paramMap.has("direction")
				? Sort.by(paramMap.get("direction"), getAllQueryValues(paramMap, "sortBy").join(","))
				: Sort.none()),
			distinctUntilChanged((a, b) => Sort.equal(a, b))
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
			distinctUntilChanged((x, y) => Filter.equal(x, y)),
			startWith(Filter.none()),
		);

	page$ = new BehaviorSubject(PagedDataSource.initPaginatorFromUrl(this.activatedRoute.snapshot.queryParamMap));

	//results data handling
	resultsDataSource: ManualPagedDataSource<Event> = new ManualPagedDataSource<Event>(this.eventService, this.page$);

	currentResults$ = new BehaviorSubject<Event[]>([]);
	results$;

	resultsTitle: BehaviorSubject<string> = new BehaviorSubject("");
	resultLength$: BehaviorSubject<number> = new BehaviorSubject(0);
	totalResultLength$: BehaviorSubject<number> = new BehaviorSubject(0);
	sortingOptions: SortingOption<Event>[] = eventSortingOptions;

	onDestroy$: Subject<any> = new Subject<any>();

	private _filterOptions$ = new BehaviorSubject<MultiLevelSelectParent[]>([
		this.filterOptionFactory.category,
		this.filterOptionFactory.price,
		this.filterOptionFactory.date,
	]);
	filterOptions$: Observable<MultiLevelSelectParent[]> = this._filterOptions$
		.asObservable()
		.pipe(
			debounceTime(200),
			scan(this.searchFilterService.mergeFilterOptions.bind(this.searchFilterService)),
			map(options => options.filter(option => option.children && option.children.length > 0)),
		);

	constructor(private activatedRoute: ActivatedRoute,
				private searchFilterService: SearchFilterService,
				private matDialog: MatDialog,
				private filterOptionBuilder: FilterOptionBuilder,
				private filterOptionFactory: FilterOptionFactoryService,
				private loginService: LogInService,
				private eventService: EventService,
				private router: Router) {
		this.resultsDataSource.isExpandable = false;
		this.resultsDataSource.filter$ = this.filter$;
		this.resultsDataSource.sort$ = this.sortedBy;
		this.init();
		this.initResults();
		this.resultsDataSource.writePaginatorUpdatesToUrl(router);
		this.resultsDataSource.updateOn(this.filter$);
		this.resultsDataSource.updateOn(this.sortedBy);
		combineLatest(this.filter$, this.sortedBy).pipe(skip(1),takeUntil(this.onDestroy$)).subscribe(() => {
			this.currentResults$.next(null);
			this.pageAt(0)
		});
	}

	get filterOptions() {
		return this._filterOptions$.getValue();
	}

	set filterOptions(options: MultiLevelSelectParent[]) {
		this._filterOptions$.next(options);
	}

	ngOnInit() {
	}

	pageAt(page: number) {
		const currentValue = this.page$.getValue();
		this.page$.next(PageRequest.at(page, currentValue.pageSize));
		this.resultsDataSource.update();
	}

	updateQueryParams($event: Params) {
		this.activatedRoute.queryParamMap.pipe(
			first()
		).subscribe(paramMap => {
			let params = QueryParameterService.updateQueryParams(paramMap, $event);
			this.router.navigate([], {queryParams: params})
		})
	}

	ngOnDestroy() {
		this.onDestroy$.next(true);
		this.onDestroy$.complete();
		this.resultsDataSource.disconnect(null);
	}

	private updateResultsTitle(results: Event[]) {
		const amount = this.resultsDataSource.currentPage$.getValue().totalElements;
		this.resultsTitle.next(results.length + " von " + amount + " Ergebnissen");
		this.resultLength$.next(results.length);
		this.totalResultLength$.next(amount);
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
			switchMap(filter => this.buildFilterOptions(filter)),
			map(options => this.searchFilterService.initFilterMenu(this.activatedRoute, options)),
			takeUntil(this.onDestroy$),
		).subscribe(this._filterOptions$);
	}

	private initResults() {
		this.results$ = this.resultsDataSource.connect();
		this.results$.pipe(
			takeUntil(this.onDestroy$)
		).subscribe(results => {
			this.currentResults$.next(results);
			this.updateResultsTitle(this.currentResults$.getValue());
		});
		this.updateResultsTitle(this.currentResults$.getValue());
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
