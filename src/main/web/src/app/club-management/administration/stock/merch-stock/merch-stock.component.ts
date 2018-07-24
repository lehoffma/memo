import {ChangeDetectorRef, Component, OnDestroy, OnInit} from "@angular/core";
import {EventService} from "../../../../shared/services/api/event.service";
import {EventType} from "../../../../shop/shared/model/event-type";
import {StockService} from "../../../../shared/services/api/stock.service";
import {LogInService} from "../../../../shared/services/api/login.service";
import {StockEntry} from "./merch-stock-entry/stock-entry";
import {MultiLevelSelectParent} from "../../../../shared/utility/multi-level-select/shared/multi-level-select-parent";
import {SearchFilterService} from "../../../../shop/search-results/search-filter.service";
import {SortingOption, SortingOptionHelper} from "../../../../shared/model/sorting-option";
import {ActivatedRoute} from "@angular/router";
import {sortingFunction} from "../../../../util/util";
import {FilterOptionBuilder} from "../../../../shop/search-results/filter-option-builder.service";
import {FilterOptionType} from "../../../../shop/search-results/filter-option-type";
import {BehaviorSubject, combineLatest, forkJoin, Observable, of, Subscription} from "rxjs";
import {debounceTime, filter, map, mergeMap, scan} from "rxjs/operators";
import {Event} from "../../../../shop/shared/model/event";
import {ConfirmationDialogService} from "../../../../shared/services/confirmation-dialog.service";
import {PageRequest} from "../../../../shared/model/api/page-request";
import {Direction, Sort} from "../../../../shared/model/api/sort";
import {Filter} from "../../../../shared/model/api/filter";

@Component({
	selector: "memo-merch-stock",
	templateUrl: "./merch-stock.component.html",
	styleUrls: ["./merch-stock.component.scss"]
})
export class MerchStockComponent implements OnInit, OnDestroy {
	//todo rewrite with filters
	_merchList$: BehaviorSubject<Event[]> = new BehaviorSubject<Event[]>(null);
	stockEntryList$: Observable<StockEntry[]> = this.getStockEntryList$();

	merch$: Observable<StockEntry[]> = this.getMerch$();
	merchList: StockEntry[] = [];

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
	filterSubscription: Subscription;
	subscription: Subscription;
	merchListSubscription: Subscription;
	private _filterOptions$ = new BehaviorSubject<MultiLevelSelectParent[]>([]);
	filterOptions$ = this._filterOptions$
		.asObservable()
		.pipe(
			debounceTime(200),
			scan(this.searchFilterService.mergeFilterOptions.bind(this.searchFilterService)),
			map(options => options.filter(option => option.children && option.children.length > 0))
		);

	constructor(private eventService: EventService,
				private loginService: LogInService,
				private stockService: StockService,
				private confirmationDialogService: ConfirmationDialogService,
				private activatedRoute: ActivatedRoute,
				private cdRef: ChangeDetectorRef,
				private searchFilterService: SearchFilterService,
				private filterOptionBuilder: FilterOptionBuilder) {
		this.merchListSubscription = this.merch$.subscribe(it => this.merchList = [...it, ...it]);
	}

	get filterOptions() {
		return this._filterOptions$.getValue();
	}

	set filterOptions(options) {
		this._filterOptions$.next(options);
	}

	ngOnInit() {
		this.filterSubscription = this.merch$
			.pipe(
				mergeMap((dataList: StockEntry[]) => this.filterOptionBuilder.empty()
					.withOptions(
						FilterOptionType.PRICE,
						FilterOptionType.COLOR,
						FilterOptionType.MATERIAL,
						FilterOptionType.SIZE
					)
					.build(Filter.none())),
				mergeMap(filterOptions => this.searchFilterService.initFilterMenu(this.activatedRoute, filterOptions))
			)
			.subscribe(this._filterOptions$);

		this.updateList();
	}

	ngOnDestroy(): void {
		if (this.filterSubscription) {
			this.filterSubscription.unsubscribe();
		}
		if (this.subscription) {
			this.subscription.unsubscribe();
		}
		if (this.merchListSubscription) {
			this.merchListSubscription.unsubscribe();
		}
	}

	updateList() {
		if (this.subscription) {
			this.subscription.unsubscribe();
		}

		this.subscription = this.eventService.getByEventType(EventType.merch, PageRequest.first(), Sort.none())
			.subscribe(it => {
				this._merchList$.next([...it.content]);
			});
	}

	/**
	 *
	 * @returns {Observable<any[]>}
	 */
	getStockEntryList$() {
		//todo pagination
		return this._merchList$
			.pipe(
				filter(it => it !== null),
				mergeMap((merch: Event[]) => {
					if (merch.length === 0) {
						return of([]);
					}

					return forkJoin(
						...merch.map(merchItem => this.stockService.getByEventId(merchItem.id, Sort.none())
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

	/**
	 *
	 * @returns {Observable<*[]>}
	 */
	getMerch$() {
		//todo pagination rewrite
		return this.stockEntryList$
			.pipe(
				mergeMap((dataList: StockEntry[]) => this.activatedRoute.queryParamMap
					.pipe(
						mergeMap(queryParamMap => {
							let list = [...dataList];

							//todo filter => categories + search bar
							const filteredBy = {};
							queryParamMap.keys.forEach(key => filteredBy[key] = queryParamMap.get(key));

							if (list.length === 0) {
								return of([]);
							}

							return combineLatest(
								...list.map(item => this.searchFilterService.satisfiesFilters(item.item, filteredBy)
									.pipe(
										map(satisfiesFilter => ({
											satisfiesFilter,
											item
										}))
									)
								)
							)
								.pipe(
									map(list => list.filter(it => it.satisfiesFilter).map(it => it.item)),
									map(list => {
										if (queryParamMap.has("sortBy") && queryParamMap.has("descending")) {
											const attribute = queryParamMap.get("sortBy");
											const descending = queryParamMap.get("descending") === "true";
											return list.sort(sortingFunction<StockEntry>(obj => obj.item[attribute], descending));
										}
										return list;
									}),
								);
						})
					)
				),
				map(it => [...it])
			);
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

}
