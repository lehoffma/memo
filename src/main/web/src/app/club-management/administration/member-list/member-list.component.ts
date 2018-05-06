import {Component, OnInit} from "@angular/core";
import {User} from "../../../shared/model/user";
import {RowActionType} from "../../../shared/utility/expandable-table/row-action-type";
import {MemberListRowAction} from "./member-list-row-actions";
import {MemberListService} from "./member-list.service";
import {UserService} from "../../../shared/services/api/user.service";
import {Filter} from "../../../shared/model/api/filter";
import {Observable, of} from "rxjs";
import {TableColumn} from "../../../shared/utility/material-table/expandable-material-table.component";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {ResponsiveColumnsHelper} from "../../../shared/utility/material-table/responsive-columns.helper";

@Component({
	selector: "memo-member-list",
	templateUrl: "./member-list.component.html",
	styleUrls: ["./member-list.component.scss"],
	providers: [MemberListService]
})
export class MemberListComponent implements OnInit {
	rowActions: {
		icon?: string;
		name: string | RowActionType;
		link?: (user: User) => string;
		route?: (user: User) => string;
	}[] = [
		{
			icon: "edit",
			name: RowActionType.EDIT
		},
		{
			icon: "delete",
			name: RowActionType.DELETE
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

	filter$: Observable<Filter> = of(Filter.none());
	columns: TableColumn<User>[] = [
		{
			columnDef: "image",
			header: "Bild",
			cell: element => element.images.length > 0 ? element.images[0] : "resources/images/Logo.png",
			type: "image"
		},
		{columnDef: "firstName", header: "Vorname", cell: element => element.firstName},
		{columnDef: "surname", header: "Nachname", cell: element => element.surname},
		{columnDef: "clubRole", header: "Rolle", cell: element => element.clubRole, type: "clubRole"},
		{columnDef: "gender", header: "Geschlecht", cell: element => element.gender, type: "gender"},
		{columnDef: "birthday", header: "Geburtstag", cell: element => element.birthday.toISOString(), type: "date"},
		{columnDef: "isWoelfeClubMember", header: "Wölfeclub", cell: element => element.isWoelfeClubMember + "", type: "boolean"},
		{columnDef: "hasSeasonTicket", header: "Dauerkarte", cell: element => element.hasSeasonTicket + "", type: "boolean"},
	];
	displayedColumns = this.columns
		.slice(1, 3)
		.map(it => it.columnDef);


	constructor(public memberListService: MemberListService,
				private breakpointObserver: BreakpointObserver,
				public userService: UserService) {
		//todo
		// const columnHelper = new ResponsiveColumnsHelper(this.columns, this.breakpointObserver);
		// columnHelper.add(Breakpoints.Small, )
	}

	ngOnInit() {
	}
}
