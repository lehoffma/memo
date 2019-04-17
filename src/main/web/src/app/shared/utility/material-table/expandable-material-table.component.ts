import {Component, ContentChild, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from "@angular/core";
import {PagedDataSource} from "./paged-data-source";
import {ServletService} from "../../services/api/servlet.service";
import {Observable, of, Subject} from "rxjs";
import {Filter} from "../../model/api/filter";
import {MatPaginator, PageEvent} from "@angular/material";
import {SelectionModel} from "@angular/cdk/collections";
import {RowAction, TableAction} from "./util/row-action";
import {RowActionType} from "./util/row-action-type";
import {TableActionEvent} from "./util/table-action-event";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {filter, takeUntil} from "rxjs/operators";
import {ActionPermissions} from "./util/action-permissions";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";

export interface TableColumn<T> {
	columnDef: string,
	header: string,
	cell: (element: T) => any;
	type?: string;
	footer?: {
		cell: () => any;
		type?: string;
	}
}

@Component({
	selector: "memo-expandable-table-empty-state-actions",
	template: "<ng-content></ng-content>",
})
export class ExpandableMaterialTableEmptyStateActions {

}

@Component({
	selector: "memo-expandable-material-table",
	templateUrl: "./expandable-material-table.component.html",
	styleUrls: ["./expandable-material-table.component.scss"],
	animations: [
		trigger("detailExpand", [
			state("collapsed", style({height: "0px", minHeight: "0", visibility: "hidden"})),
			state("expanded", style({height: "*", visibility: "visible"})),
			transition("expanded <=> collapsed", animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)")),
		]),
	],
})
export class ExpandableMaterialTableComponent<T> implements OnInit, OnDestroy {

	@Input() dataSource: PagedDataSource<T> = new PagedDataSource<T>();
	expandedRows: TableColumn<T>[] = [];
	@Input() withSelection = true;
	@Input() title: string;
	@Input() headerLink: string;
	@Input() headerLinkText: string;
	@Input() withHeaderAction = true;
	@Input() withMultiEdit = false;
	@Input() selectedActions: TableAction<T>[] = [];
	@Input() rowActions: RowAction<T>[] = [
		{
			icon: "edit",
			name: RowActionType.EDIT
		},
		{
			icon: "delete",
			name: RowActionType.DELETE
		}
	];
	@Input() permissions: ActionPermissions = {
		Hinzufuegen: true,
		Bearbeiten: true,
		Loeschen: true
	};
	@Input() withFooter = false;
	@Input() stickyFooter = false;
	@Output() onAction = new EventEmitter<TableActionEvent<T>>();
	@Output() pageChange = new EventEmitter<PageEvent>();
	@ViewChild(MatPaginator) paginator: MatPaginator;
	pageSize = 1;

	@Input() emptyStateHeader: string;
	@Input() emptyStateSubtitle: string;
	@Input() emptyStateIcon: string;
	@ContentChild(ExpandableMaterialTableEmptyStateActions) customActions: ExpandableMaterialTableEmptyStateActions;

	public selection: SelectionModel<T>;
	public expansionSelection: SelectionModel<any>;
	private onDestroy$: Subject<any> = new Subject<any>();
	isExpansionDetailRow = (i: number, row: Object) => row.hasOwnProperty("detailRow");

	constructor(private activatedRoute: ActivatedRoute,
				private router: Router,) {
		this.selection = new SelectionModel<T>(true, []);
		this.expansionSelection = new SelectionModel<any>(true, [], true);

		this.onAction
			.pipe(
				filter((it: TableActionEvent<T>) => it.action === RowActionType.DELETE),
				takeUntil(this.onDestroy$)
			)
			.subscribe(it => {
				this.dataSource.reload();
			});

	}

	_dataService: ServletService<T>;

	@Input() set dataService(dataService: ServletService<T>) {
		this._dataService = dataService;
		this.dataSource.dataService = this._dataService;
		this.dataSource.filter$ = this._filter$;
	}

	_filter$: Observable<Filter> = of(Filter.none());

	@Input() set filter$(filter$: Observable<Filter>) {
		this._filter$ = filter$;
		this.dataSource.filter$ = this._filter$;
	}

	_columns: TableColumn<T>[] = [];

	get columns() {
		return this._columns;
	}

	@Input() set columns(columns: TableColumn<T>[]) {
		this._columns = columns;
		this.updateExpandedRows(this.columns, this._displayedColumns);
	}

	_displayedColumns = [];

	get displayedColumns() {
		let base = [...this._displayedColumns];
		if (this.withSelection) {
			base.push("select");
		}
		base.push("actions");
		return base;
	}

	@Input() set displayedColumns(displayedColumns: string[]) {
		this._displayedColumns = [...displayedColumns];
		this.updateExpandedRows(this.columns, this._displayedColumns);
	}

	@Input() set writePageToUrl(writePageToUrl: boolean) {
		if (writePageToUrl) {
			this.dataSource.writePaginatorUpdatesToUrl(this.router);
		}
	}

	ngOnInit() {
		this.dataSource.paginator = this.paginator;
		this.paginator.page.pipe(takeUntil(this.onDestroy$))
			.subscribe(it => this.pageChange.emit(it));
		this.initPaginatorFromUrl(this.activatedRoute.snapshot.queryParamMap);
	}

	updateExpandedRows(columns: TableColumn<T>[], displayedColumns: string[]) {
		this.expandedRows = columns.filter(it => displayedColumns.indexOf(it.columnDef) === -1);

	}


	initPaginatorFromUrl(queryParamMap: ParamMap) {
		if (queryParamMap.has("page")) {
			const page = +queryParamMap.get("page");
			const pageSize = +queryParamMap.get("pageSize");
			if (!isNaN(pageSize)) {
				this.pageSize = pageSize;
			}
			if (!isNaN(page)) {
				this.paginator.pageIndex = page - 1;
			}
		}
	}


	/** Whether the number of selected elements matches the total number of rows. */
	isAllSelected() {
		const numSelected = this.selection.selected.length;
		const numRows = this.paginator.length;
		return numSelected === numRows;
	}

	/** Selects all rows if they are not all selected; otherwise clear selection. */
	masterToggle() {
		this.isAllSelected() ?
			this.selection.clear() :
			this.dataSource.data.forEach(row => this.selection.select(row));
	}

	ngOnDestroy(): void {
		this.onDestroy$.next();
		this.onDestroy$.complete();
	}
}
