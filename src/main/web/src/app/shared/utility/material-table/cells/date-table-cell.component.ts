import {Component, OnInit} from "@angular/core";
import {ExpandableTableCellComponent} from "../util/expandable-table-cell.component";

@Component({
	selector: "td [memoDateTableCell]",
	template: `{{data | dateFormat}}`,
})
export class DateTableCellComponent implements OnInit, ExpandableTableCellComponent {
	data: any;

	constructor() {
	}

	ngOnInit() {
	}

}
