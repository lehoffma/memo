import {Component, Input, OnInit} from "@angular/core";
import {ExpandableTableCellComponent} from "../util/expandable-table-cell.component";

@Component({
	selector: "td [booleanCheckMarkCell],memo-boolean-checkmark-cell",
	template: `
		<span class="data-as-icon"><mat-icon [ngClass]="{'true': data}">{{data? 'check' : 'clear'}}</mat-icon></span>
	`,
	styleUrls: ["./boolean-checkmark-cell.component.scss"]
})

export class BooleanCheckMarkCellComponent implements OnInit, ExpandableTableCellComponent {
	@Input() data: boolean;

	constructor() {
	}

	ngOnInit() {
	}
}
