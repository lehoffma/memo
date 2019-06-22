import {TableActionEvent} from "./table-action-event";
import {RowActionType} from "./row-action-type";
import {OnDestroy} from "@angular/core";
import {ActionPermissions} from "./action-permissions";
import {Observable, Subject} from "rxjs";

export abstract class ExpandableTableContainerService<T> implements OnDestroy {
	actionHandlers: {
		[rowActionName: string]: (entries: T[]) => any
	} = {};

	protected constructor(public permissions$: Observable<ActionPermissions>,) {
	}

	onDestroy$ = new Subject();

	ngOnDestroy() {
		this.onDestroy$.next(true);
	}

	/**
	 * Adds an object to the data list
	 */
	abstract add(): void;

	/**
	 * Edits the given object
	 * @param {T} entry
	 */
	abstract edit(entry: T): void;


	editMultiple(entries: T[]): void {
		throw new Error("Not implemented");
	}

	/**
	 * Removes the list of objects
	 * @param {T[]} entries
	 */
	abstract remove(entries: T[]): void;


	/**
	 * Callback for every table's action
	 * @param {TableActionEvent<Entry>} event
	 * @returns {any}
	 */
	handleTableAction(event: TableActionEvent<T>) {
		switch (event.action) {
			case RowActionType.ADD:
				return this.add();
			case RowActionType.EDIT:
				if (event.entries.length > 1) {
					return this.editMultiple(event.entries);
				}
				return this.edit(event.entries[0]);
			case RowActionType.DELETE:
				return this.remove(event.entries);
		}
		if (this.actionHandlers[event.action]) {
			return this.actionHandlers[event.action](event.entries);
		}
	}
}
