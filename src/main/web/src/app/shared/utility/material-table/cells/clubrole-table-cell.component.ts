import {Component, Input, OnChanges, OnInit, SimpleChanges} from "@angular/core";
import {ExpandableTableCellComponent} from "../util/expandable-table-cell.component";
import {ClubRole} from "../../../model/club-role";

@Component({
	selector: "td [clubRoleTableCell],memo-clubrole-table-cell",
	template: `
		<span class="data-as-icon" title="{{data}}"><mat-icon>{{data | clubRoleIcon}}</mat-icon></span>
		<span class="data-as-text {{data}}">{{data}}</span>
	`,
	styleUrls: ["./icon-data-table-cell.component.scss", "./clubrole-table-cell.component.scss"]
})
export class ClubRoleTableCellComponent implements OnInit, ExpandableTableCellComponent {
	@Input() data: ClubRole;

	constructor() {
	}

	ngOnInit() {}
}
