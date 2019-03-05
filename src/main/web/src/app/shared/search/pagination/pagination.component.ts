import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {Page} from "../../model/api/page";
import {BehaviorSubject, Observable} from "rxjs";
import {filter, map} from "rxjs/operators";

@Component({
	selector: "memo-pagination",
	templateUrl: "./pagination.component.html",
	styleUrls: ["./pagination.component.scss"]
})
export class PaginationComponent implements OnInit {
	_page$ = new BehaviorSubject<Page<any>>(null);
	page$ = this._page$.pipe(filter(it => it !== null));

	pageOptions$: Observable<number[]> = this.page$.pipe(
		map(page => this.getPageOptions(page))
	);
	isFirstPage$: Observable<boolean> = this.page$.pipe(
		map(page => page.first)
	);
	isLastPage$: Observable<boolean> = this.page$.pipe(
		map(page => page.last)
	);

	@Input() set page(page: Page<any>) {
		this._page$.next(page);
	}

	@Output() pageChange: EventEmitter<number> = new EventEmitter();

	constructor() {
	}

	ngOnInit() {
	}

	private getPageOptions(page: Page<any>, mobile = false): number[] {
		let lastPage = Math.ceil(page.totalElements / page.pageSize);
		let options = [];

		if (page.page === 1) {
			options = [
				page.page,
				page.page + 1,
				page.page + 2,
				mobile ? null : page.page + 3,
				mobile ? null : page.page + 4,
			]
		} else if (page.page === lastPage) {
			options = [
				mobile ? null : page.page - 4,
				mobile ? null : page.page - 3,
				page.page - 2,
				page.page - 1,
				page.page,
			]
		} else {
			options = [
				mobile ? null : page.page - 2,
				page.page - 1,
				page.page,
				page.page + 1,
				mobile ? null : page.page + 2,
			];
		}

		console.log(options);
		return options
			.filter(it => it !== null)
			.filter(it => it >= 1 && it <= lastPage);
	}

	changePage(diff: number) {
		this.pageChange.emit(this._page$.getValue().page + diff);
	}

	firstPage() {
		this.pageChange.emit(0);
	}

	lastPage() {
		const page = this._page$.getValue();
		this.pageChange.emit(Math.floor(page.totalElements / page.pageSize));
	}
}
