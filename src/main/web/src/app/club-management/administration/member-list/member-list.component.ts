import {AfterViewInit, Component, OnInit, ViewChild} from "@angular/core";
import {User, userPermissions} from "../../../shared/model/user";
import {RowActionType} from "../../../shared/utility/material-table/util/row-action-type";
import {MemberListRowAction} from "./member-list-row-actions";
import {MemberListService} from "./member-list.service";
import {UserService} from "../../../shared/services/api/user.service";
import {Filter} from "../../../shared/model/api/filter";
import {Observable, of} from "rxjs";
import {ExpandableMaterialTableComponent, TableColumn} from "../../../shared/utility/material-table/expandable-material-table.component";
import {BreakpointObserver} from "@angular/cdk/layout";
import {ResponsiveColumnsHelper} from "../../../shared/utility/material-table/responsive-columns.helper";
import {map, startWith} from "rxjs/operators";
import {RowAction} from "../../../shared/utility/material-table/util/row-action";
import {LogInService} from "../../../shared/services/api/login.service";
import {ClubRole, isAuthenticated} from "../../../shared/model/club-role";
import {Permission} from "../../../shared/model/permission";

@Component({
	selector: "memo-member-list",
	templateUrl: "./member-list.component.html",
	styleUrls: ["./member-list.component.scss"],
	providers: [MemberListService]
})
export class MemberListComponent implements OnInit, AfterViewInit {
	rowActions$: Observable<RowAction<User>[]> = this.loginService.currentUser$.pipe(
		map((currentUser: User) => {
			let base: RowAction<User>[] = [
				{
					icon: "edit",
					name: RowActionType.EDIT
				},
				{
					icon: "delete",
					name: RowActionType.DELETE
				},
			];

			if (currentUser && (isAuthenticated(currentUser.clubRole, ClubRole.Vorstand) || userPermissions(currentUser).userManagement > Permission.read)) {
				base.push(...[
						{
							icon: "phone",
							name: MemberListRowAction.phone,
							predicate: user => user.telephone !== null,
							link: user => "tel:" + user.telephone,
						},
						{
							icon: "smartphone",
							name: MemberListRowAction.call,
							predicate: user => user.mobile !== null,
							link: user => "tel:" + user.mobile
						},
						{
							icon: "email",
							name: MemberListRowAction.email,
							link: user => "mailto:" + user.email
						}
					]
				)
			}

			base.push(
				{
					icon: "person",
					name: MemberListRowAction.showProfile,
					route: user => "/members/" + user.id
				}
			);

			return base;
		})
	);

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
		{columnDef: "joinDate", header: "Beitrittsdatum", cell: element => element.joinDate.toISOString(), type: "date"},
		{columnDef: "isWoelfeClubMember", header: "Wölfeclub", cell: element => element.isWoelfeClubMember, type: "boolean"},
		{columnDef: "hasSeasonTicket", header: "Dauerkarte", cell: element => element.hasSeasonTicket, type: "boolean"},
	];
	displayedColumns$ = this.getDisplayedColumns();

	@ViewChild(ExpandableMaterialTableComponent) table: ExpandableMaterialTableComponent<User>;

	constructor(public memberListService: MemberListService,
				private breakpointObserver: BreakpointObserver,
				private loginService: LogInService,
				public userService: UserService) {
	}

	ngOnInit() {
	}

	getDisplayedColumns() {
		const columnHelper = new ResponsiveColumnsHelper(this.columns, this.breakpointObserver);
		columnHelper.addPixelBreakpoint(1200, "image");
		columnHelper.addPixelBreakpoint(400, "clubRole");
		columnHelper.addPixelBreakpoint(500, "joinDate");
		columnHelper.addPixelBreakpoint(700, "birthday", "hasSeasonTicket", "isWoelfeClubMember");
		columnHelper.addPixelBreakpoint(800, "gender");
		return columnHelper.build()
			.pipe(startWith([]));
	}

	ngAfterViewInit(): void {
		this.memberListService.dataSource = this.table.dataSource;
	}
}
