import {ChangeDetectionStrategy, Component, Input, OnInit} from "@angular/core";
import {ExpandableTableCellComponent} from "../util/expandable-table-cell.component";

@Component({
	selector: "memo-title-subtitle-cell",
	template: `
		<span class="title">{{data.title}}</span>
		<span class="subtitle">{{data.subtitle}}</span>
	`,
	styleUrls: ["./title-subtitle-cell.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleSubtitleCellComponent implements OnInit, ExpandableTableCellComponent {
	@Input() data: {title: string, subtitle: string};

	constructor() {
	}

	ngOnInit() {
	}
}
