import {RowAction} from "./row-action";

export interface TableActionEvent<T> {
	action: string|RowAction,
	entries: T[]
}
