import {Component, OnInit} from '@angular/core';
import {ExpandableTableCellComponent} from "../../../../shared/expandable-table/expandable-table-cell.component";

@Component({
	selector: 'td [memoPictureTableCellComponent]',
	template: `
		<img src="{{data}}"/>
	`,
	styleUrls: ["./picture-table-cell.component.scss"]
})

export class PictureTableCellComponent implements OnInit, ExpandableTableCellComponent {
	data: any;

	constructor() {
	}

	ngOnInit() {
	}
}
