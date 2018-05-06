import {DataSource} from "@angular/cdk/table";
import {CollectionViewer} from "@angular/cdk/collections";
import {BehaviorSubject, combineLatest, Observable, Subscription} from "rxjs";
import {Page} from "../../model/api/page";
import {ServletService} from "../../services/api/servlet.service";
import {map, mergeMap, tap} from "rxjs/operators";
import {MatPaginator, MatSort, PageEvent} from "@angular/material";
import {Filter} from "../../model/api/filter";
import {PageRequest} from "../../model/api/page-request";
import {Sort} from "../../model/api/sort";
import {SortDirection} from "@angular/material/sort/typings/sort-direction";

export class PagedDataSource<T, PageType extends Page<T>> extends DataSource<T> {
	private dataService: ServletService;
	private _paginator: MatPaginator;
	private _sort: MatSort;	//todo remove probably
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
	 * @param sort
	 */
	public set sort(sort: { active: string, direction: SortDirection }) {
		this._sortEvents$.next(sort);
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

	constructor(dataService: ServletService<T>) {
		super();
		this.dataService = dataService;
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
			this._filter$
		)
			.pipe(
				tap(() => this._isLoading$.next(true)),
				mergeMap(([pageEvent, sortEvent, filter]:
							  [PageRequest, Sort, Filter]) => {
					return this.dataService.get(
						filter,
						pageEvent,
						sortEvent
					)
				}),
				tap(it => {
					this.dataLength = it.totalElements;
					this.data = it.content;
					this._isLoading$.next(false);
				}),
				map(it => {
					let rows = [];

					it.content.forEach(element => rows.push(element, {detailRow: true, element}));

					return rows;
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

}
