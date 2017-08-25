import {ExpandableTableCellComponent} from "./expandable-table-cell.component";
import {Type} from "@angular/core";
import {DefaultExpandableTableCellComponent} from "./default-expandable-table-cell.component";

export class ExpandableTableColumn<T> {
	//todo tooltip

	constructor(public title: string,
				public key: keyof T,
				public component: Type<ExpandableTableCellComponent> = DefaultExpandableTableCellComponent) {

	}
}
