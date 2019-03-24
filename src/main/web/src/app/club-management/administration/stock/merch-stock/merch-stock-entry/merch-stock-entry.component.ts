import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from "@angular/core";
import {StockEntry, StockListEntry, StockStatus} from "./stock-entry";
import {WindowService} from "../../../../../shared/services/window.service";
import {MatTableDataSource} from "@angular/material";
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {filter, mergeMap, takeUntil} from "rxjs/operators";
import {ResponsibilityService} from "../../../../../shop/shared/services/responsibility.service";
import {User} from "../../../../../shared/model/user";

@Component({
	selector: "memo-merch-stock-entry",
	templateUrl: "./merch-stock-entry.component.html",
	styleUrls: ["./merch-stock-entry.component.scss"]
})
export class MerchStockEntryComponent implements OnInit, OnDestroy {
	Status = StockStatus;

	@Output() onDelete = new EventEmitter<number>();
	private _stockEntry$ = new BehaviorSubject<StockEntry>(null);

	responsible$: Observable<User[]> = this._stockEntry$
		.pipe(mergeMap(event => this.responsibilityServive.getResponsible(event.item.id)));

	dataSource: MatTableDataSource<StockListEntry> = new MatTableDataSource();

	_onDestroy$ = new Subject();
	displayedColumns: string[] = ['color', 'size', 'amount', 'status']

	constructor(public windowService: WindowService,
				private responsibilityServive: ResponsibilityService) {
		this._stockEntry$.pipe(filter(it => it !== null && it !== undefined), takeUntil(this._onDestroy$))
			.subscribe(stockEntry => this.dataSource.data = stockEntry.stock)
	}

	get stockEntry() {
		return this._stockEntry$.getValue();
	}

	@Input()
	set stockEntry(stockEntry: StockEntry) {
		this._stockEntry$.next(stockEntry);
	}

	ngOnInit() {
	}

	deleteMerch(id: number) {
		this.onDelete.emit(id);
	}

	ngOnDestroy(): void {
		this._onDestroy$.next(true);
	}

}
