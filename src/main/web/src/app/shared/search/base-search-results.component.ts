import {OnDestroy} from "@angular/core";
import {BehaviorSubject, combineLatest, Observable, Subject} from "rxjs";
import {debounceTime, distinctUntilChanged, map, scan, skip, startWith, switchMap, takeUntil} from "rxjs/operators";
import {Sort} from "../model/api/sort";
import {getAllQueryValues} from "../model/util/url-util";
import {Filter} from "../model/api/filter";
import {NOW} from "../../util/util";
import {PagedDataSource} from "../utility/material-table/paged-data-source";
import {ManualPagedDataSource} from "../utility/material-table/manual-paged-data-source";
import {SortingOption} from "../model/sorting-option";
import {eventSortingOptions} from "./sorting-options";
import {FilterOption} from "./filter-options/filter-option";
import {ActivatedRoute, Router} from "@angular/router";
import {SearchFilterService} from "./search-filter.service";
import {NavigationService} from "../services/navigation.service";
import {LogInService} from "../services/api/login.service";
import {PageRequest} from "../model/api/page-request";
import {ServletService} from "../services/api/servlet.service";

export type FilterTransformationMap = {[key: string]: (key: string, value: string) => {key: string; value: string}};

export class FilterTransformations{
	public static none(): FilterTransformationMap{
		return {};
	}
}

export abstract class BaseSearchResultsComponent<T> implements OnDestroy {
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

						if(this.filterTransformationMap[key]){
							let result = this.filterTransformationMap[key](key, value);
							key = result.key;
							value = result.value;
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
	resultsDataSource: ManualPagedDataSource<T> = new ManualPagedDataSource<T>(this.dataService, this.page$);

	currentResults$ = new BehaviorSubject<T[]>([]);
	results$: Observable<T[]>;

	onDestroy$: Subject<any> = new Subject<any>();

	filterOptions$: Observable<FilterOption[]> = this._filterOptions$
		.asObservable()
		.pipe(
			debounceTime(200),
			scan(this.searchFilterService.mergeFilterOptions.bind(this.searchFilterService)),
			map(options => options.filter(option => option.isShown())),
		);

	protected constructor(protected _filterOptions$: BehaviorSubject<FilterOption[]>,
						  public sortingOptions: SortingOption<T>[],
						  public userCanAddItem$: Observable<boolean>,
						  protected filterTransformationMap: {[key: string]: (key: string, value: string) => {key: string; value: string}},
						  protected activatedRoute: ActivatedRoute,
						  protected searchFilterService: SearchFilterService,
						  protected navigationService: NavigationService,
						  protected loginService: LogInService,
						  protected dataService: ServletService<T>,
						  protected router: Router,
	) {
		this.resultsDataSource.isExpandable = false;
		this.resultsDataSource.filter$ = this.filter$;
		this.resultsDataSource.sort$ = this.sortedBy;
		this.init();
		this.initResults();
		this.resultsDataSource.writePaginatorUpdatesToUrl(router, () => this.navigationService.queryParams$.getValue());
		this.resultsDataSource.updateOn(this.filter$);
		this.resultsDataSource.updateOn(this.sortedBy);
		combineLatest([this.filter$, this.sortedBy]).pipe(skip(1), takeUntil(this.onDestroy$)).subscribe(() => {
			this.currentResults$.next(null);
			this.pageAt(0)
		});
	}


	pageAt(page: number) {
		const currentValue = this.page$.getValue();
		this.page$.next(PageRequest.at(page, currentValue.pageSize));
		this.resultsDataSource.update();
	}

	ngOnDestroy() {
		this.onDestroy$.next(true);
		this.resultsDataSource.disconnect(null);
	}

	protected abstract buildFilterOptions(filter: Filter): Observable<FilterOption[]>;

	private init() {
		//initialize filter menu
		this.filter$.pipe(
			switchMap(filter => this.buildFilterOptions(filter)),
			takeUntil(this.onDestroy$),
		).subscribe(this._filterOptions$);
	}

	private initResults() {
		this.results$ = this.resultsDataSource.connect();
		this.results$.pipe(
			takeUntil(this.onDestroy$)
		).subscribe(results => {
			this.currentResults$.next(results);
		});
	}
}
