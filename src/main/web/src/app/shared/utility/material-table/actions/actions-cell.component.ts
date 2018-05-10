import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {TableActionEvent} from "../util/table-action-event";
import {ConfirmationDialogService} from "../../../services/confirmation-dialog.service";
import {SelectionModel} from "@angular/cdk/collections";
import {RowActionType} from "../util/row-action-type";
import {RowAction} from "../util/row-action";
import {ActionPermissions} from "../util/action-permissions";

@Component({
	selector: "memo-actions-cell",
	templateUrl: "./actions-cell.component.html",
	styleUrls: ["./actions-cell.component.scss"]
})
export class ActionsCellComponent<T> implements OnInit {

	@Input() element: T;
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
	@Input() selection: SelectionModel<T>;

	constructor(private confirmationDialogService: ConfirmationDialogService) {
	}

	ngOnInit() {
	}


	/**
	 *
	 * @param object
	 * @param action
	 * @returns {boolean}
	 */
	actionIsDisabled(object: T, action: RowAction<T>): boolean {
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
				"Wollen Sie diesen Eintrag wirklich löschen?",
				() => this.onAction.emit({action, entries: data})
			)
		}
		else {
			this.onAction.emit({action, entries: data});
		}
	}

}
