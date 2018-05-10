import {Component, Input, OnChanges, OnInit, SimpleChanges} from "@angular/core";
import {ExpandableTableCellComponent} from "../util/expandable-table-cell.component";
import {ClubRole} from "../../../model/club-role";

@Component({
	selector: "td [clubRoleTableCell],memo-clubrole-table-cell",
	template: `
		<span class="data-as-icon" title="{{data}}"><mat-icon>{{icon}}</mat-icon></span>
		<span class="data-as-text {{data}}">{{data}}</span>
	`,
	styleUrls: ["./icon-data-table-cell.component.scss", "./clubrole-table-cell.component.scss"]
})
export class ClubRoleTableCellComponent implements OnInit, OnChanges, ExpandableTableCellComponent {
	@Input() data: ClubRole;
	icon: string;

	constructor() {
	}

	ngOnInit() {
		this.icon = this.getIcon(this.data);
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes["data"]) {
			this.icon = this.getIcon(this.data);
		}
	}

	getIcon(role: ClubRole): string {
		switch (role) {
			case ClubRole.Admin:
				return "grade";
			case ClubRole.Kassenwart:
				return "attach_money";
			case ClubRole.Mitglied:
				return "account_box";
			case ClubRole.Organisator:
				return "assignment";
			case ClubRole.Vorstand:
				return "gavel";
			case ClubRole.Gast:
				return "do_not_disturb";
		}
	}
}
