import {Component, Input, OnInit} from "@angular/core";
import {ExpandableTableCellComponent} from "../../../../shared/utility/material-table/util/expandable-table-cell.component";

@Component({
	selector: "td [merch-stock-table-cell-component]",
	template: `		
		<span [ngClass]="{'is-zero': data === 0}">
			{{data}}
		</span>
	`,
	styles: [
		`
			.is-zero{
				color: rgba(0, 0, 0, 0.38);
			}
			
		`
	]
})

export class MerchStockTableCellComponent implements OnInit, ExpandableTableCellComponent {
	@Input() data: number;

	constructor() {
	}

	ngOnInit() {
	}
}
