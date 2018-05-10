import {RowActionType} from "./row-action-type";

export interface RowAction<T> {
	icon?: string;
	name: string | RowActionType;
	predicate?: (object: T) => boolean;
	link?: (object: T) => string;
	route?: (object: T) => string;
}
