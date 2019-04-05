import {ChangeDetectionStrategy, Component, Input, OnInit} from "@angular/core";
import {ExpandableTableCellComponent} from "../util/expandable-table-cell.component";

@Component({
	selector: "memo-link-table-cell",
	template: `
		<a routerLink="{{data.routerLink}}" matTooltip="{{data.tooltip}}" [ngStyle]="data.styles || {}">{{data.text}}</a>
	`,
	styleUrls: ["./link-table-cell.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class LinkTableCellComponent implements OnInit, ExpandableTableCellComponent {
	@Input() data: {
		text: string;
		routerLink: string;
		tooltip?: string;
		styles?: {
			[key: string]: string;
		}
	};

	constructor() {
	}

	ngOnInit() {
	}


}
