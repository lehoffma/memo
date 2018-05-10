import {DataSource} from "@angular/cdk/table";
import {CollectionViewer} from "@angular/cdk/collections";
import {BehaviorSubject, combineLatest, Observable, Subscription} from "rxjs";
import {Page} from "../../model/api/page";
import {filter, map, mergeMap, tap} from "rxjs/operators";
import {MatPaginator, PageEvent} from "@angular/material";
import {Filter} from "../../model/api/filter";
import {PageRequest} from "../../model/api/page-request";
import {Sort} from "../../model/api/sort";
import {SortDirection} from "@angular/material/sort/typings/sort-direction";
import {TableDataService} from "./table-data-service";

export class PagedDataSource<T, DataServiceType = T> extends DataSource<T> {
	private dataService$: BehaviorSubject<TableDataService<DataServiceType>> = new BehaviorSubject<TableDataService<DataServiceType>>(null);
	private _paginator: MatPaginator;
	private _pageEvents$: BehaviorSubject<PageEvent> = new BehaviorSubject<PageEvent>({
		pageIndex: 0,
		pageSize: 20,
		length: 20,
		previousPageIndex: 0
	});
	private _sortEvents$: BehaviorSubject<{ active: string, direction: SortDirection }> = new BehaviorSubject({
		active: null,
		direction: (<SortDirection>"")
	});

	public _filter$: BehaviorSubject<Filter> = new BehaviorSubject<Filter>(Filter.none());

	private _isLoading$: BehaviorSubject<boolean> = new BehaviorSubject(true);
	public isLoading$: Observable<boolean> = this._isLoading$.asObservable();

	private _pageEventSubscription: Subscription;
	private _filterSubscription: Subscription;

	private _reloadEmitter: BehaviorSubject<any> = new BehaviorSubject(true);

	private _isExpandable$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

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
			.subscribe(event => this._pageEvents$.next(event));
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
			}))
		)
			.subscribe(event => this._pageEvents$.next(event));
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

	public setSort(sort: Sort) {
		this._sortEvents$.next({
			active: sort.sortBys[0],
			direction: sort.direction
		})
	}

	/**
	 *
	 * @param {Observable<Filter>} filter$
	 */
	public set filter$(filter$: Observable<Filter>) {
		if (this._filterSubscription) {
			this._filterSubscription.unsubscribe();
		}

		this._filterSubscription = filter$.subscribe(filter => this._filter$.next(filter));
	}

	public data: T[] = [];
	public dataLength: number = 0;


	constructor(dataService?: TableDataService<DataServiceType>) {
		super();
		if (dataService) {
			this.dataService$.next(dataService);
		}
	}

	public set dataService(dataService: TableDataService<DataServiceType>) {
		this.dataService$.next(dataService);
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
							   [PageRequest, Sort, Filter, TableDataService<DataServiceType>, any]): Observable<Page<T>> {
		return dataService.get(
			filter,
			pageEvent,
			sortEvent
		)
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
		)
			.pipe(
				filter(([pageEvent, sortEvent, filter, dataService, reload]:
							[PageRequest, Sort, Filter, TableDataService, any]) => dataService !== null),
				tap(() => this._isLoading$.next(true)),
				mergeMap(([pageEvent, sortEvent, filter, dataService, reload]:
							  [PageRequest, Sort, Filter, TableDataService, any]) => {
					return this.getPagedData([pageEvent, sortEvent, filter, dataService, reload]);
				}),
				tap(it => {
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
							}
							else {
								it.content.forEach(element => rows.push(element));
							}
							return rows;
						})
					)

				}),
				tap(it => console.log(it)),
			)
	}

	/**
	 *
	 * @param {CollectionViewer} collectionViewer
	 */
	disconnect(collectionViewer: CollectionViewer): void {
		if (this._pageEventSubscription) {
			this._pageEventSubscription.unsubscribe();
		}
		if (this._filterSubscription) {
			this._filterSubscription.unsubscribe();
		}
	}


	reload() {
		this._reloadEmitter.next(true);
	}
}
