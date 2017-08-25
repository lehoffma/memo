import {Component, OnInit} from '@angular/core';
import {ExpandableTableCellComponent} from "../../../shared/expandable-table/expandable-table-cell.component";
import {EntryCategory} from "../../../shared/model/entry-category";

@Component({
	selector: 'td [entryCategoryCellComponent]',
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
