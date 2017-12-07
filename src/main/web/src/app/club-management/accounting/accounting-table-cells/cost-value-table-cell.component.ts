import {Component, Input, OnInit} from "@angular/core";
import {ExpandableTableCellComponent} from "../../../shared/expandable-table/expandable-table-cell.component";

@Component({
	selector: "td [costValueTableCell]",
	template: `
		<span [ngClass]="{'positive': data >= 0}">
			{{data | currency:'EUR':'symbol'}}
			<!--{{data.toFixed(2)}} €-->
		</span>
	`,
	styleUrls: ["./cost-value-table-cell.component.scss"]
})

export class CostValueTableCellComponent implements OnInit, ExpandableTableCellComponent {
	@Input() data: number;

	constructor() {
	}

	ngOnInit() {
	}
}
