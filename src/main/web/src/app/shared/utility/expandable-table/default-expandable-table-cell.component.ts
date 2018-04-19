import {Component, OnInit} from "@angular/core";
import {ExpandableTableCellComponent} from "./expandable-table-cell.component";

@Component({
	selector: "td [MemoDefaultColumn]",
	template: "<div>{{data}}</div>",
	styles: [`
		:host {
			word-break: break-all;
			padding-right: 20px;
		}
	`]
})
export class DefaultExpandableTableCellComponent implements OnInit, ExpandableTableCellComponent {
	data: any;

	constructor() {
	}

	ngOnInit() {
	}

}
