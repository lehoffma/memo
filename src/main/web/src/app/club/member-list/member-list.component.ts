import {AfterViewInit, Component, OnInit} from "@angular/core";
import {MemberListService} from "./member-list.service";
import {Observable} from "rxjs";
import {BreakpointObserver} from "@angular/cdk/layout";
import {startWith} from "rxjs/operators";
import {RowAction} from "../../shared/utility/material-table/util/row-action";
import {User} from "../../shared/model/user";
import {TableColumn} from "../../shared/utility/material-table/expandable-material-table.component";
import {FilterOption} from "../../shared/search/filter-options/filter-option";
import {UserActionsService} from "../../shared/services/user-actions.service";
import {LogInService} from "../../shared/services/api/login.service";
import {UserService} from "../../shared/services/api/user.service";
import {ResponsiveColumnsHelper} from "../../shared/utility/material-table/responsive-columns.helper";

@Component({
	selector: "memo-member-list",
	templateUrl: "./member-list.component.html",
	styleUrls: ["./member-list.component.scss"],
	providers: [MemberListService]
})
export class MemberListComponent implements OnInit, AfterViewInit {
	rowActions$: Observable<RowAction<User>[]> = this.userActionsService.getUserActions(value => value);

	columns: TableColumn<User>[] = [
		{
			columnDef: "image",
			header: "Bild",
			cell: element => element.images.length > 0 ? element.images : ["resources/images/Logo.png"],
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

	filterOptions: FilterOption[] = [
		//filter by
		//	- search input (todo)
		//	- age
		//	- club role
		//	- club zugehörigkeit
	];

	constructor(public memberListService: MemberListService,
				private userActionsService: UserActionsService,
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
	}
}
