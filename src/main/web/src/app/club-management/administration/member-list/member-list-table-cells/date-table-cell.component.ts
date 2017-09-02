import {Component, OnInit} from "@angular/core";
import {ExpandableTableCellComponent} from "../../../../shared/expandable-table/expandable-table-cell.component";

@Component({
	selector: "td [memoDateTableCell]",
	template: `{{data | moment}}`,
})
export class DateTableCellComponent implements OnInit, ExpandableTableCellComponent {
	data: any;

	constructor() {
	}

	ngOnInit() {
	}

}
