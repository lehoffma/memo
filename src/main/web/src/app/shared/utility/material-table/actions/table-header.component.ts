import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {SelectionModel} from "@angular/cdk/collections";
import {TableActionEvent} from "../util/table-action-event";
import {RowActionType} from "../util/row-action-type";
import {ConfirmationDialogService} from "../../../services/confirmation-dialog.service";
import {ActionPermissions} from "../util/action-permissions";
import {TableAction} from "../util/row-action";


@Component({
	selector: "memo-actions-header-cell",
	templateUrl: "./table-header.component.html",
	styleUrls: ["./table-header.component.scss"]
})
export class TableHeaderComponent<T> implements OnInit {
	@Input() selectedActions: TableAction<T>[] = [];
	@Input() selection: SelectionModel<T>;
	@Input() title: string;
	@Input() link: string;
	@Input() linkText: string;
	@Input() withAdd = true;
	@Output() onAction = new EventEmitter<TableActionEvent<T>>();

	@Input() permissions: ActionPermissions = {
		Hinzufuegen: true,
		Bearbeiten: true,
		Loeschen: true
	};

	rowAction = RowActionType;

	constructor(private confirmationDialogService: ConfirmationDialogService) {

	}

	ngOnInit(): void {
	}


	/**
	 *
	 * @param object
	 * @param action
	 * @returns {boolean}
	 */
	actionIsDisabled(object: T[], action: TableAction<T>): boolean {
		return !this.permissions || (action.predicate && !action.predicate(object)) ||
			(this.permissions[action.name] === undefined ? false : !this.permissions[action.name])
	}

	/**
	 * Callback of a generic action (e.g. edit/remove/see profile etc.
	 * @param {string} action
	 * @param {T[]} data
	 */
	actionCallback(action: string | RowActionType, data: T[]) {
		if (action === RowActionType.DELETE && data.length === 1) {
			this.confirmationDialogService.open(
				"Möchtest du diesen Eintrag wirklich löschen?",
				() => this.onAction.emit({action, entries: data})
			)
		} else {
			this.onAction.emit({action, entries: data});
		}
	}

	/**
	 *
	 */
	deleteSelected() {
		const entriesToDelete = this.selection.selected;

		this.confirmationDialogService.open(
			entriesToDelete.length > 1
				? `Möchtest du diese ${entriesToDelete.length} Einträge wirklich löschen?`
				: `Möchtest du diesen Eintrag wirklich löschen?`,
			() => {
				this.onAction.emit({action: RowActionType.DELETE, entries: entriesToDelete});
				this.selection.clear();
			}
		)
	}

	editMultiple() {
		this.onAction.emit({action: RowActionType.EDIT, entries: this.selection.selected});
		this.selection.clear();
	}
}
