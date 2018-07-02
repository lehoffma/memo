import {RowActionType} from "./row-action-type";

export interface TableActionEvent<T> {
	action: string | RowActionType,
	entries: T[]
}
