import {Component, Input, OnInit} from "@angular/core";
import {ExpandableTableCellComponent} from "../../../../shared/utility/expandable-table/expandable-table-cell.component";

@Component({
	selector: "td [booleanCheckMarkCell]",
	template: `
		<span class="data-as-icon"><mat-icon [ngClass]="{'true': data}">{{data ? 'check' : 'clear'}}</mat-icon></span>
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
