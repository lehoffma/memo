import {Component, Input, OnInit} from "@angular/core";
import {ExpandableTableCellComponent} from "../../../../shared/expandable-table/expandable-table-cell.component";

@Component({
	selector: "td [booleanCheckMarkCell]",
	template: `
		<span class="data-as-icon"><md-icon [ngClass]="{'true': data}">{{data ? 'check' : 'clear'}}</md-icon></span>
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
