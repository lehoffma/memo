import {ExpandableTableColumn} from "./expandable-table-column";

export interface ExpandedRowComponent<T> {
	data: any;
	keys: ExpandableTableColumn<T>[]
}
