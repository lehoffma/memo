import {Component, Input, OnChanges, OnInit, SimpleChanges} from "@angular/core";
import {ExpandableTableCellComponent} from "../../../../../shared/expandable-table/expandable-table-cell.component";

@Component({
	selector: "td [sumTableCell]",
	template: `
		<span>{{sum}}</span>
	`
})
export class MerchStockTotalTableCellComponent implements OnInit, OnChanges, ExpandableTableCellComponent {
	@Input() data: number[];
	sum: number;

	constructor() {
	}

	ngOnInit() {
		this.updateSum();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes["date"]) {
			this.updateSum();
		}
	}

	updateSum() {
		this.sum = this.data[this.data.length - 1];
	}
}
