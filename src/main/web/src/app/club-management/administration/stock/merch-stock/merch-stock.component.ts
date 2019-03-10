import {ChangeDetectorRef, Component, OnDestroy, OnInit} from "@angular/core";
import {EventService} from "../../../../shared/services/api/event.service";
import {StockService} from "../../../../shared/services/api/stock.service";
import {LogInService} from "../../../../shared/services/api/login.service";
import {StockEntry} from "./merch-stock-entry/stock-entry";
import {MultiLevelSelectParent} from "../../../../shared/utility/multi-level-select/shared/multi-level-select-parent";
import {SearchFilterService} from "../../../../shared/search/search-filter.service";
import {SortingOption, SortingOptionHelper} from "../../../../shared/model/sorting-option";
import {ActivatedRoute, Params, Router} from "@angular/router";
import {FilterOptionBuilder} from "../../../../shared/search/filter-option-builder.service";
import {SearchResultsFilterOption} from "../../../../shared/search/search-results-filter-option";
import {BehaviorSubject, forkJoin, Observable, of, Subject} from "rxjs";
import {debounceTime, filter, first, map, mergeMap, scan, takeUntil} from "rxjs/operators";
import {Event} from "../../../../shop/shared/model/event";
import {ConfirmationDialogService} from "../../../../shared/services/confirmation-dialog.service";
import {Direction, Sort} from "../../../../shared/model/api/sort";
import {Filter} from "../../../../shared/model/api/filter";
import {PagedDataSource} from "../../../../shared/utility/material-table/paged-data-source";
import {QueryParameterService} from "../../../../shared/services/query-parameter.service";
import {FilterOption} from "../../../../shared/search/filter-options/filter-option";

@Component({
	selector: "memo-merch-stock",
	templateUrl: "./merch-stock.component.html",
	styleUrls: ["./merch-stock.component.scss"]
})
export class MerchStockComponent implements OnInit, OnDestroy {
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

	filter$ = new BehaviorSubject<Filter>(Filter.by({type: "3"}));
	sort$ = new BehaviorSubject<Sort>(Sort.none());

	onDestroy$ = new Subject<any>();

	dataSource = new PagedDataSource(this.eventService);
	filteredMerch$ = this.dataSource.connect();
	filteredMerchStock$: Observable<Event[]> = this.getStockEntryList$(this.filteredMerch$);

	constructor(private eventService: EventService,
				private loginService: LogInService,
				private stockService: StockService,
				private confirmationDialogService: ConfirmationDialogService,
				private activatedRoute: ActivatedRoute,
				private cdRef: ChangeDetectorRef,
				private router: Router,
				private searchFilterService: SearchFilterService,
				private filterOptionBuilder: FilterOptionBuilder) {
		this.dataSource.isExpandable = false;
		this.dataSource.filter$ = this.filter$;
		this.dataSource.sort$ = this.sort$;
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

		this.updateFilterFromUrl();
		this.updateSortFromUrl();
		this.updateList();
	}

	ngOnDestroy(): void {
		this.onDestroy$.next();
		this.onDestroy$.complete();
		this.dataSource.disconnect(null);
	}

	updateList() {
		this.dataSource.reload();
	}

	updateFilterFromUrl() {
		this.activatedRoute.queryParamMap.pipe(
			takeUntil(this.onDestroy$)
		).subscribe(queryParamMap => {
			const filteredBy = {type: "3"};
			queryParamMap.keys.forEach(key => filteredBy[key] = queryParamMap.get(key));
			this.filter$.next(Filter.by(filteredBy));
		})
	}

	updateSortFromUrl() {
		this.activatedRoute.queryParamMap.pipe(
			takeUntil(this.onDestroy$)
		).subscribe(queryParamMap => {
			const attribute = queryParamMap.get("sortBy");
			const descending = queryParamMap.get("descending");
			this.sort$.next(Sort.by(descending, attribute));
		})
	}

	/**
	 *
	 * @returns {Observable<any[]>}
	 */
	getStockEntryList$(merch$: Observable<Event[]>) {
		//todo pagination?
		//todo move to server side
		return merch$
			.pipe(
				filter(it => it !== null),
				mergeMap((merch: Event[]) => {
					if (merch.length === 0) {
						return of([]);
					}

					return forkJoin(
						...merch.map(merchItem => this.stockService.getByEventId(merchItem.id)
							.pipe(
								map(stockList => ({
									stockMap: this.stockService.toStockMap(stockList),
									options: this.stockService.getStockOptions([stockList]),
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
						this.updateList();
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

}
