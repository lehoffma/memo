import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	ComponentFactoryResolver,
	EventEmitter,
	Input,
	OnInit,
	Output,
	QueryList,
	Type,
	ViewChildren
} from "@angular/core";
import {ExpandedRowComponent} from "./expanded-row.component";
import {ExpandedTableRowContainerDirective} from "./expanded-table-row-container.directive";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {ColumnSortingEvent} from "./column-sorting-event";
import {ExpandableTableColumn} from "./expandable-table-column";
import {ExpandableTableColumnContainerDirective} from "./expandable-table-column-container.directive";
import {ConfirmationDialogService} from "../services/confirmation-dialog.service";
import {RowAction} from "./row-action";
import {TableActionEvent} from "./table-action-event";


export interface ActionPermissions {
	"Hinzufuegen": boolean;
	"Bearbeiten": boolean;
	"Loeschen": boolean;
}

@Component({
	selector: "memo-expandable-table",
	templateUrl: "./expandable-table.component.html",
	styleUrls: ["./expandable-table.component.scss"],
	animations: [
		trigger("expandedState", [
			state("1", style({transform: "rotate(180deg)"})),
			state("0", style({transform: "rotate(360deg)"})),
			transition("0 => 1", animate("200ms ease-in")),
			transition("1 => 0", animate("200ms ease-out")),
		])
	],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExpandableTableComponent<T extends { id: number }> implements OnInit, AfterViewInit {
	rowAction = RowAction;

	@Input() data: T[];
	@Input() columnKeys: ExpandableTableColumn<T>[];
	@Input() expandedRowComponent: Type<ExpandedRowComponent<T>>;
	@Input() expandedRowKeys: ExpandableTableColumn<T>[];
	@Input() title: string;
	@Input() expandable: boolean = true;

	@Input() permissions: ActionPermissions = {
		Hinzufuegen: true,
		Bearbeiten: true,
		Loeschen: true
	};

	@Input() rowActions: {
		icon?: string;
		name: string | RowAction;
		link?: (object: T) => string;
		route?: (object: T) => string;
	}[] = [
		{
			icon: "edit",
			name: RowAction.EDIT
		},
		{
			icon: "delete",
			name: RowAction.DELETE
		}
	];

	@Output() onAction = new EventEmitter<TableActionEvent<T>>();

	@Output() onSort = new EventEmitter<ColumnSortingEvent<T>>();

	tableRowHostList: QueryList<ExpandedTableRowContainerDirective>;
	@ViewChildren(ExpandableTableColumnContainerDirective) tableCellList: QueryList<ExpandableTableColumnContainerDirective>;
	expandStatusList: {
		[id: number]: boolean
	} = {};
	selectedStatusList: {
		[id: number]: boolean
	} = {};
	sortedBy: ColumnSortingEvent<T>;
	//pagination variables
	@Input() pagination = true;
	currentPage = 1;
	@Input() rowsPerPage = 50;
	rowsPerPageOptions = [5, 10, 25, 50];

	constructor(private _componentFactoryResolver: ComponentFactoryResolver,
				private confirmationDialogService: ConfirmationDialogService) {

	}

	//using a setter because the ViewChildren() annotation doesn't update correctly if used with hidden elements
	@ViewChildren(ExpandedTableRowContainerDirective)
	set tableRowHosts(content: QueryList<ExpandedTableRowContainerDirective>) {
		this.tableRowHostList = content;
	}

	_everythingIsSelected = false;

	get everythingIsSelected() {
		return this._everythingIsSelected;
	}

	set everythingIsSelected(value) {
		this._everythingIsSelected = value;
		this.changeSelectedStatusOfAllItems(value);
	}

	//todo falls performance zu scheiße => observables
	get amountOfSelectedEntries() {
		return Object.keys(this.selectedStatusList).filter(key => this.selectedStatusList[key]).length;
	}

	ngOnInit() {
	}

	ngAfterViewInit(): void {
		if (this.data && this.data !== null) {
			this.initTableCells(this.tableCellList, this.data);
		}
		this.tableCellList.changes
			.subscribe(tableCellList => this.initTableCells(tableCellList, this.data));
	}

	/**
	 * Initializes the table cell components
	 * @param tableCellList
	 * @param data
	 */
	initTableCells(tableCellList: QueryList<ExpandableTableColumnContainerDirective>, data: T[]) {
		let start = (this.currentPage - 1) * this.rowsPerPage;
		let end = (this.currentPage * this.rowsPerPage);
		let index = 0;
		data.slice(start, end).forEach(dataObject => {
			this.columnKeys.forEach(columnKey => {
				let componentFactory = this._componentFactoryResolver.resolveComponentFactory(columnKey.component);

				let viewContainerRef = tableCellList.toArray()[index].viewContainerRef;

				//remove previous view
				viewContainerRef.clear();

				//create new view and set the data attribute
				let componentRef = viewContainerRef.createComponent(componentFactory);
				componentRef.instance.data = dataObject[columnKey.key];
				componentRef.changeDetectorRef.detectChanges();

				index++;
			})
		});
	}

	/**
	 * Toggles the row-expanded status of the given data object
	 * @param data
	 */
	toggleExpandedStatus(data: T) {
		const toggledValue = !this.expandStatusList[data.id];
		this.expandStatusList[data.id] = toggledValue;

		if (toggledValue) {
			//todo there has to be a better way
			//if you don't use a timeout here, the viewChildren() setter will not have been called,
			//i.e. the container is undefined => error. There are no problems whatsoever if you use a timeout though.
			setTimeout(value => this.openRow(data), 1);
		}
	}

	/**
	 * Toggles the row-selected status of the given data object
	 * @param data
	 */
	toggleSelectedStatus(data: T) {
		this.selectedStatusList[data.id] = !this.selectedStatusList[data.id];
		this.updateEverythingIsSelected();
	}

	/**
	 * Updates the everythingIsSelected value
	 */
	updateEverythingIsSelected() {
		this._everythingIsSelected = this.data.every(dataObject => this.selectedStatusList[dataObject.id]);
	}

	/**
	 * callback for select-all checkbox at the top of the table
	 */
	changeSelectedStatusOfAllItems(newStatus: boolean) {
		this.data.forEach(dataObject => {
			this.selectedStatusList[dataObject.id] = newStatus;
		});
	}

	/**
	 *
	 * @param {"start" | "end"} which
	 * @param {number} currentPage
	 * @param {number} rowsPerPage
	 * @param {boolean} pagination
	 * @returns {number}
	 */
	getPaginationIndex(which: "start" | "end", currentPage: number, rowsPerPage: number, pagination: boolean = true) {
		if (pagination) {
			return ((currentPage - ((which === "start") ? 1 : 0)) * rowsPerPage);
		}
		return which === "start"
			? 0
			: Infinity;
	}

	/**
	 * Expands the row associated with the given data object and dynamically initializes the child component contained
	 * in the expanded row.
	 * @param data
	 */
	openRow(data: T) {
		let componentFactory = this._componentFactoryResolver.resolveComponentFactory(this.expandedRowComponent);
		let viewContainerIndex = Object.keys(this.expandStatusList)
			.filter(status => this.expandStatusList[status])
			.indexOf("" + data.id);

		let viewContainerRef = this.tableRowHostList.toArray()[viewContainerIndex].viewContainerRef;


		//remove previous view
		viewContainerRef.clear();

		//create new view and set the data attribute
		let componentRef = viewContainerRef.createComponent(componentFactory);
		componentRef.instance.data = data;
		componentRef.instance.keys = this.expandedRowKeys;
		componentRef.changeDetectorRef.detectChanges();
	}

	/**
	 * Handles repeated column presses by toggling the descending value and otherwise just updates the key.
	 * @param key
	 */
	sort(key: keyof T) {
		//first sort
		if (!this.sortedBy) {
			this.sortedBy = {
				key,
				descending: true
			}
		}
		else {
			//the user pressed on the same column more than once => toggle the descending/ascending status
			if (this.sortedBy && this.sortedBy.key === key) {
				this.sortedBy.descending = !this.sortedBy.descending;
			}
			else {
				this.sortedBy.descending = true;
			}
			this.sortedBy.key = key;
		}
		this.onSort.emit(this.sortedBy);
	}


	/**
	 * Callback of a generic action (e.g. edit/remove/see profile etc.
	 * @param {string} action
	 * @param {T[]} data
	 */
	actionCallback(action: string | RowAction, data: T[]) {
		if (action === RowAction.DELETE && data.length === 1) {
			this.confirmationDialogService.openDialog(
				"Wollen Sie diesen Eintrag wirklich löschen?"
			)
				.subscribe(accepted => {
					if (accepted) {
						this.onAction.emit({action, entries: data});
						this.selectedStatusList[data[0].id] = false;
					}
				})
		}
		else {
			this.onAction.emit({action, entries: data});
		}
	}

	/**
	 *
	 */
	deleteSelected() {
		const entriesToDelete = Object.keys(this.selectedStatusList)
			.filter(key => this.selectedStatusList[key])
			.map(id => this.data.find(dataObject => "" + dataObject.id === id));

		this.confirmationDialogService.openDialog(
			entriesToDelete.length > 1
				? `Wollen Sie diese ${entriesToDelete.length} Einträge wirklich löschen?`
				: `Wollen Sie diesen Eintrag wirklich löschen?`
		)
			.subscribe(accepted => {
				if (accepted) {
					this.onAction.emit({action: RowAction.DELETE, entries: entriesToDelete});
					this.selectedStatusList = {};
				}
			});
	}

}
