import {ChangeDetectorRef, Component, OnDestroy, OnInit} from "@angular/core";
import {EventService} from "../../../../shared/services/api/event.service";
import {StockService} from "../../../../shared/services/api/stock.service";
import {LogInService} from "../../../../shared/services/api/login.service";
import {StockEntry} from "./merch-stock-entry/stock-entry";
import {SearchFilterService} from "../../../../shared/search/search-filter.service";
import {SortingOption, SortingOptionHelper} from "../../../../shared/model/sorting-option";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {FilterOptionBuilder} from "../../../../shared/search/filter-option-builder.service";
import {SearchResultsFilterOption} from "../../../../shared/search/search-results-filter-option";
import {BehaviorSubject, combineLatest, Observable, of, Subject} from "rxjs";
import {debounceTime, distinctUntilChanged, filter, first, map, mergeMap, scan, tap} from "rxjs/operators";
import {Event} from "../../../../shop/shared/model/event";
import {ConfirmationDialogService} from "../../../../shared/services/confirmation-dialog.service";
import {Direction, Sort} from "../../../../shared/model/api/sort";
import {Filter} from "../../../../shared/model/api/filter";
import {QueryParameterService} from "../../../../shared/services/query-parameter.service";
import {FilterOption} from "../../../../shared/search/filter-options/filter-option";
import {PageRequest} from "../../../../shared/model/api/page-request";
import {ManualPagedDataSource} from "../../../../shared/utility/material-table/manual-paged-data-source";
import {getAllQueryValues} from "../../../../shared/model/util/url-util";
import {NavigationService} from "../../../../shared/services/navigation.service";

@Component({
	selector: "memo-merch-stock",
	templateUrl: "./merch-stock.component.html",
	styleUrls: ["./merch-stock.component.scss"]
})
export class MerchStockComponent implements OnInit, OnDestroy {
	page$ = new BehaviorSubject(PageRequest.at(
		(+this.activatedRoute.snapshot.queryParamMap.get("page") || 1) - 1,
		(+this.activatedRoute.snapshot.queryParamMap.get("pageSize") || 20)
	));

	userCanAddMerch$ = this.loginService.getActionPermissions("merch")
		.pipe(
			map(permission => permission.Hinzufuegen)
		);
	sortingOptions: SortingOption<StockEntry>[] = [
		SortingOptionHelper.build(
			"Alphabetisch A-Z",
			Sort.by(Direction.ASCENDING, "title")
		),
		SortingOptionHelper.build(
			"Alphabetisch Z-A",
			Sort.by(Direction.DESCENDING, "title")
		),
	];
	filterOptions$ = new BehaviorSubject<FilterOption[]>([]);

	sortedBy$: Observable<Sort> = this.navigationService.queryParamMap$
		.pipe(
			map(paramMap => paramMap.has("sortBy") && paramMap.has("direction")
				? Sort.by(paramMap.get("direction"), getAllQueryValues(paramMap, "sortBy").join(","))
				: Sort.by(Direction.ASCENDING, "title")),
			distinctUntilChanged((a, b) => Sort.equal(a, b))
		);

	filteredBy$: Observable<Filter> = this.navigationService.queryParamMap$
		.pipe(
			map(paramMap => {
				let paramObject = {};
				paramMap.keys
					.filter(key => !["page", "pageSize", "sortBy", "direction"].includes(key))
					.forEach(key => {
						paramObject[key] = getAllQueryValues(paramMap, key).join(",");
					});

				paramObject["type"] = 3;

				return Filter.by(paramObject);
			}),
			distinctUntilChanged((a, b) => Filter.equal(a, b))
		);

	onDestroy$ = new Subject<any>();

	dataSource = new ManualPagedDataSource(this.eventService, this.page$);
	filteredMerch$ = this.dataSource.connect();
	filteredMerchStock$: Observable<StockEntry[]> = this.getStockEntryList$(this.filteredMerch$);

	constructor(private eventService: EventService,
				private loginService: LogInService,
				private stockService: StockService,
				private confirmationDialogService: ConfirmationDialogService,
				private activatedRoute: ActivatedRoute,
				private navigationService: NavigationService,
				private cdRef: ChangeDetectorRef,
				private router: Router,
				private searchFilterService: SearchFilterService,
				private filterOptionBuilder: FilterOptionBuilder) {
		this.dataSource.isExpandable = false;
		this.dataSource.filter$ = this.filteredBy$;
		this.dataSource.sort$ = this.sortedBy$;

		this.dataSource.initPaginatorFromUrlAndUpdatePage(this.navigationService.queryParamMap$.getValue());
		this.dataSource.writePaginatorUpdatesToUrl(this.router);

		this.dataSource.updateOn(
			combineLatest(
				this.filteredBy$,
				this.sortedBy$
			).pipe(
				debounceTime(100),
				tap(() => this.pageAt(0)),
			)
		);

	}

	ngOnInit() {
		this.filterOptionBuilder.empty()
			.withOptions(
				SearchResultsFilterOption.PRICE,
				SearchResultsFilterOption.COLOR,
				SearchResultsFilterOption.MATERIAL,
				SearchResultsFilterOption.SIZE
			)
			.build(Filter.none())
			.pipe(
				debounceTime(200),
				scan(this.searchFilterService.mergeFilterOptions.bind(this.searchFilterService)),
				map(options => options.filter(option => option.isShown())),
				map(options => [...options]),
			)
			.subscribe(val => this.filterOptions$.next(val));
	}

	ngOnDestroy(): void {
		this.onDestroy$.next(true);
		this.dataSource.disconnect(null);
	}


	/**
	 *
	 * @returns {Observable<any[]>}
	 */
	getStockEntryList$(merch$: Observable<Event[]>): Observable<StockEntry[]> {
		return merch$
			.pipe(
				filter(it => it !== null),
				mergeMap((merch: Event[]) => {
					if (merch.length === 0) {
						return of([]);
					}

					return combineLatest(
						...merch.map(merchItem => this.stockService.getByEventId(merchItem.id)
							.pipe(
								map(stockList => ({
									stock: this.stockService.toStock(stockList),
									item: merchItem
								}))
							)
						))
				})
			)
	}


	deleteMerch(id: number) {
		this.confirmationDialogService.open("Möchtest du diesen Merch-Artikel wirklich löschen?",
			() => {
				this.eventService.remove(id)
				//todo
					.subscribe(() => {
						this.dataSource.reload()
					}, error => console.error(error));
			})
	}


	updateQueryParams($event: Params) {
		this.activatedRoute.queryParamMap.pipe(
			first()
		).subscribe(paramMap => {
			let params = QueryParameterService.updateQueryParams(paramMap, $event);
			this.router.navigate([], {queryParams: params})
		})
	}

	linkToCreatePage() {
		this.router.navigate(["shop", "create", "merch"])
	}

	pageAt(page: number) {
		const currentValue = this.page$.getValue();
		this.page$.next(PageRequest.at(page, currentValue.pageSize));
		this.dataSource.update();
	}
}
