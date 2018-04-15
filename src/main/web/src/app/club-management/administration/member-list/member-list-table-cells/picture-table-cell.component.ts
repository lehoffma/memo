import {Component, OnInit} from '@angular/core';
import {ExpandableTableCellComponent} from "../../../../shared/utility/expandable-table/expandable-table-cell.component";

@Component({
	selector: 'td [memoPictureTableCellComponent]',
	template: `
		<img src="{{(data && data.length > 0 && data[0]) ? data[0] : defaultPath}}"/>
	`,
	styleUrls: ["./picture-table-cell.component.scss"]
})

export class PictureTableCellComponent implements OnInit, ExpandableTableCellComponent {
	defaultPath = "resources/images/Logo.png";
	data: any[];

	constructor() {
	}

	ngOnInit() {
	}
}
