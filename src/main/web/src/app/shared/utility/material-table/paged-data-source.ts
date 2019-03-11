import {DataSource} from "@angular/cdk/table";
import {CollectionViewer} from "@angular/cdk/collections";
import {BehaviorSubject, combineLatest, Observable, Subject, Subscription} from "rxjs";
import {Page, PageResponse} from "../../model/api/page";
import {filter, map, mergeMap, takeUntil, tap} from "rxjs/operators";
import {MatPaginator, PageEvent} from "@angular/material";
import {Filter} from "../../model/api/filter";
import {PageRequest} from "../../model/api/page-request";
import {Sort} from "../../model/api/sort";
import {SortDirection} from "@angular/material/sort/typings/sort-direction";
import {TableDataService} from "./table-data-service";
import {ParamMap, Params, Router} from "@angular/router";

export class PagedDataSource<T> extends DataSource<T> {
	public currentPage$: BehaviorSubject<Page<T>> = new BehaviorSubject<Page<T>>(PageResponse.empty());
	public data: T[] = [];
	public dataLength: number = 0;
	protected dataService$: BehaviorSubject<TableDataService<T>> = new BehaviorSubject<TableDataService<T>>(null);
	protected _pageEvents$: BehaviorSubject<PageEvent> = new BehaviorSubject<PageEvent>({
		pageIndex: 0,
		pageSize: 20,
		length: 20,
		previousPageIndex: 0
	});
	protected _sortEvents$: BehaviorSubject<{ active: string, direction: SortDirection }> = new BehaviorSubject({
		active: null,
		direction: (<SortDirection>"")
	});
	protected _isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
	public isLoading$: Observable<boolean> = this._isLoading$.asObservable();
	protected _pageEventSubscription: Subscription;
	protected _filterSubscription: Subscription;
	protected _sortSubscription: Subscription;
	protected _reloadEmitter: BehaviorSubject<any> = new BehaviorSubject(true);
	protected _isExpandable$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

	protected _pause$ = new BehaviorSubject(false);

	protected onDestroy$: Subject<any> = new Subject<any>();

	constructor(dataService?: TableDataService<T>, page$?: Observable<PageRequest>, filter$?: Observable<Filter>) {
		super();
		if (dataService) {
			this.dataService$.next(dataService);
		}
		if (page$) {
			this.setPage(page$);
		}
		if (filter$) {
			this.filter$ = filter$;
		}
	}

	protected _paginator: MatPaginator;

	/**
	 *
	 * @param paginator
	 */
	public set paginator(paginator: MatPaginator) {
		this._paginator = paginator;

		if (this._pageEventSubscription) {
			this._pageEventSubscription.unsubscribe();
		}

		this._pageEventSubscription = paginator.page
			.pipe(takeUntil(this.onDestroy$))
			.subscribe(event => this._pageEvents$.next(event));
	}

	public _filter$: BehaviorSubject<Filter> = new BehaviorSubject<Filter>(Filter.none());

	/**
	 *
	 * @param {Observable<Filter>} filter$
	 */
	public set filter$(filter$: Observable<Filter>) {
		if (this._filterSubscription) {
			this._filterSubscription.unsubscribe();
		}

		this._filterSubscription = filter$
			.pipe(takeUntil(this.onDestroy$))
			.subscribe(filter => this._filter$.next(filter));
	}

	public set isExpandable(value: boolean) {
		this._isExpandable$.next(value);
	}

	/**
	 *
	 * @param sort
	 */
	public set sort(sort: { active: string, direction: SortDirection }) {
		this._sortEvents$.next(sort);
	}

	/**
	 *
	 * @param sort$
	 */
	public set sort$(sort$: Observable<Sort>) {
		if (this._sortSubscription) {
			this._sortSubscription.unsubscribe();
		}

		this._sortSubscription = sort$
			.pipe(takeUntil(this.onDestroy$))
			.subscribe(sort => this.setSort(sort));
	}

	public set dataService(dataService: TableDataService<T>) {
		this.dataService$.next(dataService);
	}

	/**
	 *
	 * @param {Observable<PageRequest>} page$
	 */
	public setPage(page$: Observable<PageRequest>) {
		if (this._pageEventSubscription) {
			this._pageEventSubscription.unsubscribe();
		}

		this._pageEventSubscription = page$.pipe(
			map(page => ({
				previousPageIndex: page.page - 1,
				pageSize: page.pageSize,
				length: page.pageSize,
				pageIndex: page.page
			})),
			takeUntil(this.onDestroy$)
		)
			.subscribe(event => this._pageEvents$.next(event));
	}

	public setSort(sort: Sort) {
		this._sortEvents$.next({
			active: sort.sortBys[0],
			direction: sort.direction
		})
	}


	initPaginatorFromUrl(queryParamMap: ParamMap): PageRequest {
		const pageRequest = PagedDataSource.initPaginatorFromUrl2(queryParamMap);
		this._pageEvents$.next({
			length: 200,
			pageIndex: pageRequest.page,
			previousPageIndex: this._pageEvents$.getValue().pageIndex,
			pageSize: pageRequest.pageSize
		});
		return pageRequest;
	}

	static initPaginatorFromUrl2(queryParamMap: ParamMap): PageRequest {
		if (queryParamMap.has("page")) {
			const page = +queryParamMap.get("page");
			const pageSize = +queryParamMap.get("pageSize");
			return PageRequest.at((page || 1) - 1, pageSize || 20);
		}
		return PageRequest.at(0);
	}

	updateToPage(pageIndex: number, pageSize: number, router: Router, combineQueryParams?: (queryParams) => Params) {
		const newQueryParams: Params = {
			page: pageIndex,
			pageSize: pageSize
		};
		let combinedParams = newQueryParams;

		if (combineQueryParams) {
			combinedParams = combineQueryParams(newQueryParams);
		}
		const containsPage = router.url.includes("page");
		router.navigate([], {queryParams: {...combinedParams}, queryParamsHandling: "merge", replaceUrl: !containsPage})
	}

	writePaginatorUpdatesToUrl(router: Router, combineQueryParams?: (queryParams) => Params) {
		this._pageEvents$.pipe(
			takeUntil(this.onDestroy$)
		)
			.subscribe(event => {
				this.updateToPage(event.pageIndex + 1, event.pageSize, router, combineQueryParams);
			})
	}

	/**
	 *
	 * @returns {Observable<T[]>}
	 */
	connect(): Observable<T[]> {
		return combineLatest(
			this._pageEvents$.pipe(
				map(page => PageRequest.fromMaterialPageEvent(page))
			),
			this._sortEvents$.pipe(
				map(sort => Sort.from(sort))
			),
			this._filter$,
			this.dataService$,
			this._reloadEmitter,
			this._pause$,
		)
			.pipe(
				filter(([pageEvent, sortEvent, filter, dataService, reload, pause]:
							[PageRequest, Sort, Filter, TableDataService<T>, any, boolean]) => !pause && dataService !== null),
				tap(() => this._isLoading$.next(true)),
				mergeMap(([pageEvent, sortEvent, filter, dataService, reload, pause]:
							  [PageRequest, Sort, Filter, TableDataService<T>, any, boolean]) => {
					return this.getPagedData([pageEvent, sortEvent, filter, dataService, reload]);
				}),
				tap(it => {
					this.currentPage$.next(it);
					this.dataLength = it.totalElements;
					this.data = it.content;
					this._isLoading$.next(false);
				}),
				mergeMap(it => {
					return this._isExpandable$.pipe(
						map(isExpandable => {
							let rows = [];
							//todo only do this if displayedColumns < columns
							if (isExpandable) {
								it.content.forEach(element => rows.push(element, {detailRow: true, element}));
							} else {
								it.content.forEach(element => rows.push(element));
							}
							return rows;
						})
					)

				}),
			)
	}

	changePauseStatus(pause: boolean) {
		this._pause$.next(pause);
	}

	/**
	 *
	 * @param {CollectionViewer} collectionViewer
	 */
	disconnect(collectionViewer: CollectionViewer): void {
		this.onDestroy$.next();
		this.onDestroy$.complete();
	}

	reload() {
		this._reloadEmitter.next(true);
	}

	/**
	 * Default implementation
	 * @param {PageRequest} pageEvent
	 * @param {Sort} sortEvent
	 * @param {Filter} filter
	 * @param {TableDataService} dataService
	 * @param {any} reload
	 * @returns {Observable<Page<T>>}
	 */
	protected getPagedData([pageEvent, sortEvent, filter, dataService, reload]:
							   [PageRequest, Sort, Filter, TableDataService<T>, any]): Observable<Page<T>> {
		return dataService.get(
			filter,
			pageEvent,
			sortEvent
		)
	}
}
