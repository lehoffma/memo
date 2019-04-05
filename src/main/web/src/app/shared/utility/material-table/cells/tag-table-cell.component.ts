import {ChangeDetectionStrategy, Component, Input, OnInit} from "@angular/core";
import {ExpandableTableCellComponent} from "../util/expandable-table-cell.component";

export type TagColor = "yellow" | "red" | "green" | "blue" | "orange" | "grey" | "purple";

@Component({
	selector: "memo-tag-table-cell",
	template: `
		<span class="tag color-{{data.color}}" [class.no-border]="data.border === false">
			{{data.text}}
		</span>
	`,
	styleUrls: ["./tag-table-cell.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TagTableCellComponent implements OnInit, ExpandableTableCellComponent {
	@Input() data: {
		text: string;
		color: TagColor;
		border?: boolean;
	};

	constructor() {
	}

	ngOnInit() {
	}


}
