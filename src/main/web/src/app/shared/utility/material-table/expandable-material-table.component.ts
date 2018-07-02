import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild} from "@angular/core";
import {PagedDataSource} from "./paged-data-source";
import {ServletService} from "../../services/api/servlet.service";
import {Observable, of, Subscription} from "rxjs";
import {Filter} from "../../model/api/filter";
import {MatPaginator} from "@angular/material";
import {SelectionModel} from "@angular/cdk/collections";
import {RowAction} from "./util/row-action";
import {RowActionType} from "./util/row-action-type";
import {TableActionEvent} from "./util/table-action-event";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {filter} from "rxjs/operators";
import {ActionPermissions} from "./util/action-permissions";

export interface TableColumn<T> {
	columnDef: string,
	header: string,
	cell: (element: T) => any;
	type?: string;
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
	@Output() onAction = new EventEmitter<TableActionEvent<T>>();
	@ViewChild(MatPaginator) paginator: MatPaginator;
	public selection: SelectionModel<T>;
	public expansionSelection: SelectionModel<any>;
	subscriptions: Subscription[];
	isExpansionDetailRow = (i: number, row: Object) => row.hasOwnProperty("detailRow");

	constructor() {
		this.selection = new SelectionModel<T>(true, []);
		this.expansionSelection = new SelectionModel<any>(true, [], true);

		this.subscriptions = [
			this.onAction
				.pipe(
					filter((it: TableActionEvent<T>) => it.action === RowActionType.DELETE)
				)
				.subscribe(it => {
					this.dataSource.reload();
				})
		];
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

	ngOnInit() {
		this.dataSource.paginator = this.paginator;
	}

	updateExpandedRows(columns: TableColumn<T>[], displayedColumns: string[]) {
		this.expandedRows = columns.filter(it => displayedColumns.indexOf(it.columnDef) === -1);

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
		if (this.subscriptions) {
			this.subscriptions.forEach(it => it.unsubscribe());
		}
	}
}
