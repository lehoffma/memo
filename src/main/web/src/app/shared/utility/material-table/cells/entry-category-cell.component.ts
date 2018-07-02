import {Component, OnInit} from "@angular/core";
import {ExpandableTableCellComponent} from "../util/expandable-table-cell.component";
import {EntryCategory} from "../../../model/entry-category";

@Component({
	selector: "td [entryCategoryCellComponent]",
	template: `
		{{data?.name}}
	`
})

export class EntryCategoryCellComponent implements OnInit, ExpandableTableCellComponent {
	data: EntryCategory;

	constructor() {
	}

	ngOnInit() {
	}
}
