import {Component, Input, OnInit} from '@angular/core';
import {ExpandableTableCellComponent} from "../../../../shared/utility/expandable-table/expandable-table-cell.component";
import {OrderStatus, orderStatusToString} from "../../../../shared/model/order-status";

@Component({
	selector: "td [orderStatusTableCell]",
	template: `
		<!--todo different icons or colors or something?-->
		{{status}}
	`,
	styles: [
			`

		`
	]
})
export class OrderStatusTableCellComponent implements OnInit, ExpandableTableCellComponent {
	get data() {
		return null;
	}

	@Input() set data(data: OrderStatus) {
		this.status = orderStatusToString(data);
	}

	status: string = "";

	constructor() {
	}

	ngOnInit() {
	}

}
