import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {SelectionModel} from "@angular/cdk/collections";
import {TableActionEvent} from "../util/table-action-event";
import {RowActionType} from "../util/row-action-type";
import {ConfirmationDialogService} from "../../../services/confirmation-dialog.service";
import {ActionPermissions} from "../util/action-permissions";

@Component({
	selector: "memo-actions-header-cell",
	templateUrl: "./table-header.component.html",
	styleUrls: ["./table-header.component.scss"]
})
export class TableHeaderComponent<T> implements OnInit {

	@Input() selection: SelectionModel<T>;
	@Input() title: string;
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

	/**
	 *
	 */
	deleteSelected() {
		const entriesToDelete = this.selection.selected;

		this.confirmationDialogService.open(
			entriesToDelete.length > 1
				? `Wollen Sie diese ${entriesToDelete.length} Einträge wirklich löschen?`
				: `Wollen Sie diesen Eintrag wirklich löschen?`,
			() => {
				this.onAction.emit({action: RowActionType.DELETE, entries: entriesToDelete});
				this.selection.clear();
			}
		)
	}

}
