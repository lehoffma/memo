import {Component, OnDestroy, OnInit} from "@angular/core";
import {ParticipantUser} from "../../../../shared/model/participant";
import {RowActionType} from "../../../../../shared/utility/material-table/util/row-action-type";
import {MemberListRowAction} from "../../../../../club-management/administration/member-list/member-list-row-actions";
import {ParticipantListService} from "./participant-list.service";
import {RowAction, TableAction} from "../../../../../shared/utility/material-table/util/row-action";
import {ParticipantDataSource, ParticipantUserService} from "./participant-data-source";
import {UserService} from "../../../../../shared/services/api/user.service";
import {TableColumn} from "../../../../../shared/utility/material-table/expandable-material-table.component";
import {map, startWith} from "rxjs/operators";
import {ResponsiveColumnsHelper} from "../../../../../shared/utility/material-table/responsive-columns.helper";
import {BreakpointObserver} from "@angular/cdk/layout";
import {Filter} from "../../../../../shared/model/api/filter";
import {EventType} from "../../../../shared/model/event-type";
import {combineLatest} from "rxjs";
import {ParticipantListOption} from "./participants-category-selection/participants-category-selection.component";


@Component({
	selector: "memo-participant-list",
	templateUrl: "./participant-list.component.html",
	styleUrls: ["./participant-list.component.scss"],
	providers: [ParticipantListService]
})
export class ParticipantListComponent implements OnInit, OnDestroy {
	rowActions: RowAction<ParticipantUser>[] = [
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
			route: participant => "/club/members/" + participant.user.id
		}
	];

	selectedActions: TableAction<ParticipantUser>[] = [
		{
			name: "editMultiple",
			label: "",
			icon: "edit",
			type: "mat-icon-button"
		}
	];

	columns: TableColumn<ParticipantUser>[] = [
		{columnDef: "name", header: "Name", cell: element => element.user.firstName + " " + element.user.surname},
		{columnDef: "status", header: "Status", cell: element => element.status},
		{columnDef: "isDriver", header: "Ist Fahrer", cell: element => element.isDriver, type: "boolean"},
		{columnDef: "needsTicket", header: "Braucht Ticket", cell: element => element.needsTicket, type: "boolean"}
	];
	displayedColumns$ = this.getDisplayedColumns();

	dataSource = new ParticipantDataSource(this.participantUserService, this.userService);

	filter$ = combineLatest(
		this.participantListService.view$,
		this.participantListService.eventInfo$
	)
		.pipe(
			map(([view, info]: [ParticipantListOption, { eventType: EventType, eventId: number }]) => {
				let viewFilters = Filter.none();
				switch (view) {
					case "needsTicket":
						viewFilters = Filter.by({needsTicket: "true"});
						break;
					case "isDriver":
						viewFilters = Filter.by({isDriver: "true"});
				}


				return Filter.combine(
					Filter.by({"eventId": "" + info.eventId}),
					viewFilters
				)
			}),
		);


	constructor(public participantListService: ParticipantListService,
				public participantUserService: ParticipantUserService,
				public breakpointObserver: BreakpointObserver,
				public userService: UserService) {
		this.participantListService.dataSource = this.dataSource;
	}

	ngOnInit() {
	}

	getDisplayedColumns() {
		const columnHelper = new ResponsiveColumnsHelper(this.columns, this.breakpointObserver);
		columnHelper.addPixelBreakpoint(500, "isDriver");
		columnHelper.addPixelBreakpoint(700, "needsTicket");
		return columnHelper.build()
			.pipe(startWith([]));
	}

	ngOnDestroy(): void {
	}


}
