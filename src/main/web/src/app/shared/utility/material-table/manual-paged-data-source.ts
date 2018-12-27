import {PagedDataSource} from "./paged-data-source";
import {combineLatest, Observable} from "rxjs";
import {filter, map, mergeMap, takeUntil, tap} from "rxjs/operators";
import {PageRequest} from "../../model/api/page-request";
import {Sort} from "../../model/api/sort";
import {TableDataService} from "./table-data-service";
import {Filter} from "../../model/api/filter";

export class ManualPagedDataSource<T> extends PagedDataSource<T> {

	constructor(dataService?: TableDataService<T>, page$?: Observable<PageRequest>, filter$?: Observable<Filter>) {
		super(dataService, page$, filter$);
	}

	private getCurrentPage() {
		return PageRequest.fromMaterialPageEvent(this._pageEvents$.getValue());
	}

	private getCurrentFilter() {
		return this._filter$.getValue();
	}

	private getCurrentSort() {
		return Sort.from(this._sortEvents$.getValue());
	}

	updateOn(obs: Observable<any>){
		obs.pipe(takeUntil(this.onDestroy$)).subscribe(it => this.update());
	}

	resetPageAndUpdateOnFilter(callback: () => void){
		this.updateOn(
			combineLatest(
				this._filter$,
				this._sortEvents$
			).pipe(
				tap(it => {
					const currentPage = {...this._pageEvents$.getValue()};
					currentPage.pageIndex = 0;
					this._pageEvents$.next(currentPage);
				}),
				tap(callback)
			)
		)
	}

	update() {
		this.reload();
	}

	connect(): Observable<T[]> {
		return combineLatest(
			this.dataService$,
			this._reloadEmitter,
			this._pause$,
		)
			.pipe(
				filter(([dataService, reload, pause]:
							[TableDataService<T>, any, boolean]) => !pause && dataService !== null),
				tap(() => this._isLoading$.next(true)),
				mergeMap(([dataService, reload, pause]:
							  [TableDataService<T>, any, boolean]) => {
					return this.getPagedData([this.getCurrentPage(), this.getCurrentSort(), this.getCurrentFilter(), dataService, reload]);
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
}
