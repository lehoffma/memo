import {Component, Input, OnInit} from "@angular/core";
import {ExpandableTableCellComponent} from "../../../../../shared/utility/material-table/util/expandable-table-cell.component";
import {User} from "../../../../../shared/model/user";

@Component({
	selector: "td [memoFullNameTableCell]",
	template: `
		{{data.firstName + " " + data.surname}}
	`
})
export class FullNameTableCellComponent implements OnInit, ExpandableTableCellComponent {
	@Input() data: User;

	constructor() {
	}

	ngOnInit() {
	}
}
