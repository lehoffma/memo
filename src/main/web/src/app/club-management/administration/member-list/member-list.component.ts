import {Component, OnInit} from "@angular/core";
import {UserService} from "../../../shared/services/api/user.service";
import {User} from "../../../shared/model/user";
import {NavigationService} from "../../../shared/services/navigation.service";
import {LogInService} from "../../../shared/services/api/login.service";
import {RowAction} from "../../../shared/expandable-table/row-action";
import {WindowService} from "../../../shared/services/window.service";
import {memberListRowActions} from "./member-list-row-actions";
import {MemberListService} from "./member-list.service";

@Component({
	selector: "memo-member-list",
	templateUrl: "./member-list.component.html",
	styleUrls: ["./member-list.component.scss"],
	providers: [MemberListService]
})
export class MemberListComponent implements OnInit {
	rowActions:{
		icon?: string;
		name: string | RowAction;
		link?: (user:User) => string;
		route?: (user:User) => string;
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
			name: memberListRowActions.phone,
			link: user => "tel:" + user.telephone
		},
		{
			icon: "smartphone",
			name: memberListRowActions.call,
			link: user => "tel:" + user.mobile
		},
		{
			icon: "email",
			name: memberListRowActions.email,
			link: user => "mailto:" + user.email
		},
		{
			icon: "person",
			name: memberListRowActions.showProfile,
			route: user => "/members/" + user.id
		}
	];


	constructor(private userService: UserService,
				public memberListService: MemberListService,
				private loginService: LogInService,
				private windowService: WindowService,
				private navigationService: NavigationService) {
	}

	ngOnInit() {
	}
}
