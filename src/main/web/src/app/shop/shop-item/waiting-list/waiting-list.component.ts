import {Component, OnInit} from "@angular/core";
import {map, startWith} from "rxjs/operators";
import {RowAction} from "../../../shared/utility/material-table/util/row-action";
import {RowActionType} from "../../../shared/utility/material-table/util/row-action-type";
import {MemberListRowAction} from "../../../club-management/administration/member-list/member-list-row-actions";
import {TableColumn} from "../../../shared/utility/material-table/expandable-material-table.component";
import {EventInfo} from "../item-details/participants/participant-list/participant-list.service";
import {BreakpointObserver} from "@angular/cdk/layout";
import {UserService} from "../../../shared/services/api/user.service";
import {ResponsiveColumnsHelper} from "../../../shared/utility/material-table/responsive-columns.helper";
import {WaitingListTableService} from "./waiting-list-table.service";
import {WaitingListDataSource, WaitingListUserService} from "./waiting-list-data-source";
import {EventType} from "../../shared/model/event-type";
import {Filter} from "../../../shared/model/api/filter";
import {WaitingListUser} from "../../shared/model/waiting-list";
import {ActivatedRoute} from "@angular/router";

@Component({
	selector: "memo-waiting-list",
	templateUrl: "./waiting-list.component.html",
	styleUrls: ["./waiting-list.component.scss"],
	providers: [
		WaitingListTableService
	]
})
export class WaitingListComponent implements OnInit {
	//todo basically just copy the participant-list component i guess

	rowActions: RowAction<WaitingListUser>[] = [
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
			predicate: participant => !!participant.user.telephone,
			link: participant => "tel:" + participant.user.telephone
		},
		{
			icon: "smartphone",
			name: MemberListRowAction.call,
			predicate: participant => !!participant.user.mobile,
			link: participant => "tel:" + participant.user.mobile
		},
		{
			icon: "email",
			name: MemberListRowAction.email,
			link: participant => "mailto:" + participant.user.email
		},
		{
			icon: "person",
			name: MemberListRowAction.showProfile,
			route: participant => "club/members/" + participant.user.id
		}
	];

	columns: TableColumn<WaitingListUser>[] = [
		{columnDef: "name", header: "Name", cell: element => element.user.firstName + " " + element.user.surname},
		...this.getAdditionalColumns()
	];
	displayedColumns$ = this.getDisplayedColumns();

	dataSource = new WaitingListDataSource(this.waitingListUserService, this.userService);

	filter$ = this.waitingListTableService.eventInfo$.pipe(
		map((info: { eventType: EventType, eventId: number }) => Filter.by({"eventId": "" + info.eventId})),
	);

	private eventType: EventType = (() => {
		let urlSegments = this.activatedRoute.snapshot.url;
		return EventType[urlSegments[1].path];
	})();

	constructor(public waitingListTableService: WaitingListTableService,
				public waitingListUserService: WaitingListUserService,
				private activatedRoute: ActivatedRoute,
				public breakpointObserver: BreakpointObserver,
				public userService: UserService) {
		this.waitingListTableService.dataSource = this.dataSource;
	}

	ngOnInit() {

	}

	getLinkToTour(info: EventInfo) {
		return `/shop/${info.eventType}/${info.eventId}`
	}

	isMerch(): boolean {
		return false;
	}

	isTour(): boolean {
		return true;
	}

	getDisplayedColumns() {
		const columnHelper = new ResponsiveColumnsHelper(this.columns, this.breakpointObserver);

		if (this.eventType === EventType.merch) {
			columnHelper.addPixelBreakpoint(500, "color");
			columnHelper.addPixelBreakpoint(700, "size");
		} else if (this.eventType === EventType.tours) {
			columnHelper.addPixelBreakpoint(500, "isDriver");
			columnHelper.addPixelBreakpoint(700, "needsTicket");
		}

		return columnHelper.build()
			.pipe(startWith(columnHelper.getAlwaysAvailableColumndefs()));
	}

	ngOnDestroy(): void {

	}


	private getAdditionalColumns(): TableColumn<WaitingListUser>[] {
		if (this.eventType === EventType.merch) {
			return [
				{columnDef: "color", header: "Farbe", cell: element => element.color, type: "color"},
				{columnDef: "size", header: "Größe", cell: element => element.size}
			]
		} else if (this.eventType === EventType.tours) {
			return [
				{columnDef: "isDriver", header: "Ist Fahrer", cell: element => element.isDriver, type: "boolean"},
				{columnDef: "needsTicket", header: "Braucht Ticket", cell: element => element.needsTicket, type: "boolean"},
			]
		}
		return [];
	}
}
