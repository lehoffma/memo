import {Component, Input, OnInit} from '@angular/core';
import {ExpandableTableCellComponent} from "../../../../shared/expandable-table/expandable-table-cell.component";

@Component({
	selector: 'td [memoTelephoneTableCellComponent]',
	template: `
		<span class="action-text">{{data}}</span>
		<a href="tel:{{data}}" md-button color="accent">
			<div>
				<md-icon>local_phone</md-icon>
				<span class="icon-text">Anrufen</span>
			</div>
		</a>
	`,
	styleUrls: ["./action-table-cell.component.scss"]
})

export class TelephoneTableCellComponent implements OnInit, ExpandableTableCellComponent {
	@Input() data: string;

	constructor() {

	}

	ngOnInit() {

	}
}
