import {Component, OnInit} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {EventService} from "../../../../shared/services/api/event.service";
import {EventType} from "../../../../shop/shared/model/event-type";
import {NavigationService} from "../../../../shared/services/navigation.service";
import {StockService} from "../../../../shared/services/api/stock.service";
import {LogInService} from "../../../../shared/services/api/login.service";
import {StockEntry} from "./merch-stock-entry/stock-entry";
import {MultiLevelSelectParent} from "../../../../shared/multi-level-select/shared/multi-level-select-parent";
import {SearchFilterService} from "../../../../shop/search-results/search-filter.service";
import {SortingOption} from "../../../../shared/model/sorting-option";
import {ActivatedRoute} from "@angular/router";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {sortingFunction} from "../../../../util/util";

@Component({
	selector: "memo-merch-stock",
	templateUrl: "./merch-stock.component.html",
	styleUrls: ["./merch-stock.component.scss"]
})
export class MerchStockComponent implements OnInit {
	stockEntryList$: Observable<StockEntry[]> = this.eventService.search("", EventType.merch)
		.flatMap(merch => Observable.forkJoin(
			...merch.map(merchItem => this.stockService.getByEventId(merchItem.id)
				.map(stockList => ({
					stockMap: this.stockService.toStockMap(stockList),
					options: this.stockService.getStockOptions([stockList]),
					item: merchItem
				}))
			))
			.defaultIfEmpty([]))
		.share()


	merch$: Observable<StockEntry[]> = this.stockEntryList$
		.flatMap((dataList: StockEntry[]) => {
			return this.activatedRoute.queryParamMap
				.flatMap(queryParamMap => {
					let list = [...dataList];

					//todo filter => categories + search bar
					const filteredBy = {};
					queryParamMap.keys.forEach(key => filteredBy[key] = queryParamMap.get(key));

					return Observable.combineLatest(...list
						.map(item => this.searchFilterService.satisfiesFilters(item.item, filteredBy)
							.map(satisfiesFilter => ({
								satisfiesFilter,
								item
							}))))
						.map(list => list.filter(it => it.satisfiesFilter).map(it => it.item))
						.map(list => {
							if (queryParamMap.has("sortBy") && queryParamMap.has("descending")) {
								const attribute = queryParamMap.get("sortBy");
								const descending = queryParamMap.get("descending") === "true";
								return list.sort(sortingFunction<StockEntry>(obj => obj.item[attribute], descending));
							}
							return list;
						})
						.defaultIfEmpty([]);
				})
		})

	userCanAddMerch$ = this.loginService.getActionPermissions("merch")
		.map(permission => permission.Hinzufuegen);


	private _filterOptions$ = new BehaviorSubject<MultiLevelSelectParent[]>([]);
	filterOptions$ = this._filterOptions$
		.asObservable()
		.debounceTime(200)
		.scan(this.searchFilterService.mergeFilterOptions.bind(this.searchFilterService))
		.map(options => options.filter(option => option.children && option.children.length > 0))
		.do(console.log);

	get filterOptions() {
		return this._filterOptions$.getValue();
	}

	set filterOptions(options) {
		this._filterOptions$.next(options);
	}

	sortingOptions: SortingOption<StockEntry>[] = [
		{
			name: "Alphabetisch A-Z",
			queryParameters: {
				sortBy: "title",
				descending: "false"
			},
		},
		{
			name: "Alphabetisch Z-A",
			queryParameters: {
				sortBy: "title",
				descending: "true"
			}
		},
	];


	constructor(private eventService: EventService,
				private loginService: LogInService,
				private stockService: StockService,
				private activatedRoute: ActivatedRoute,
				private searchFilterService: SearchFilterService,
				private navigationService: NavigationService) {
	}

	ngOnInit() {
		this.merch$
			//todo searchFilterBuilder
			.flatMap((dataList: StockEntry[]) => this.searchFilterService
				.getEventFilterOptionsFromResults(dataList.map(it => it.item))
			)
			.map(filterOptions => filterOptions
				.filter(option => option.queryKey !== "category" && option.queryKey !== "date"))
			.flatMap(filterOptions => this.searchFilterService.initFilterMenu(this.activatedRoute, filterOptions))
			.subscribe(options => {
				this.filterOptions = options
			});
	}


	deleteMerch(id:number){
		console.warn("delete merch not implemented yet. ", id);
	}

}
