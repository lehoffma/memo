import {Component, OnInit} from "@angular/core";
import {User} from "../../../shared/model/user";
import {RowAction} from "../../../shared/expandable-table/row-action";
import {MemberListRowAction} from "./member-list-row-actions";
import {MemberListService} from "./member-list.service";
import {UserService} from "../../../shared/services/api/user.service";
import {empty} from "rxjs/observable/empty";

@Component({
	selector: "memo-member-list",
	templateUrl: "./member-list.component.html",
	styleUrls: ["./member-list.component.scss"],
	providers: [MemberListService]
})
export class MemberListComponent implements OnInit {
	rowActions: {
		icon?: string;
		name: string | RowAction;
		link?: (user: User) => string;
		route?: (user: User) => string;
	}[] = [
		{
			icon: "edit",
			name: RowAction.EDIT
		},
		{
			icon: "delete",
			name: RowAction.DELETE
		},
		{
			icon: "phone",
			name: MemberListRowAction.phone,
			link: user => "tel:" + user.telephone
		},
		{
			icon: "smartphone",
			name: MemberListRowAction.call,
			link: user => "tel:" + user.mobile
		},
		{
			icon: "email",
			name: MemberListRowAction.email,
			link: user => "mailto:" + user.email
		},
		{
			icon: "person",
			name: MemberListRowAction.showProfile,
			route: user => "/members/" + user.id
		}
	];

	constructor(public memberListService: MemberListService) {
	}

	ngOnInit() {
	}
}
