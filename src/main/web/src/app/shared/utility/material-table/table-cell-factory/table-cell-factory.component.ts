import {Component, Input, OnInit} from "@angular/core";
import {TableColumn} from "../expandable-material-table.component";

@Component({
	selector: "memo-table-cell-factory",
	templateUrl: "./table-cell-factory.component.html",
	styleUrls: ["./table-cell-factory.component.scss"]
})
export class TableCellFactoryComponent<T> implements OnInit {
	@Input() element: T;
	@Input() column: {
		cell: (element?: T) => any;
		type?: string;
	};

	constructor() {
	}

	ngOnInit() {
	}

}
