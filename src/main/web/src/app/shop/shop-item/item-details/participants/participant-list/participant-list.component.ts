import {Component, OnDestroy, OnInit} from "@angular/core";
import {ParticipantUser} from "../../../../shared/model/participant";
import {RowActionType} from "../../../../../shared/utility/material-table/util/row-action-type";
import {MemberListRowAction} from "../../../../../club-management/administration/member-list/member-list-row-actions";
import {ParticipantListService} from "./participant-list.service";
import {RowAction, TableAction} from "../../../../../shared/utility/material-table/util/row-action";
import {ParticipantDataSource, ParticipantUserService} from "./participant-data-source";
import {UserService} from "../../../../../shared/services/api/user.service";
import {TableColumn} from "../../../../../shared/utility/material-table/expandable-material-table.component";
import {map, startWith, switchMap, takeUntil} from "rxjs/operators";
import {ResponsiveColumnsHelper} from "../../../../../shared/utility/material-table/responsive-columns.helper";
import {BreakpointObserver} from "@angular/cdk/layout";
import {Filter} from "../../../../../shared/model/api/filter";
import {EventType} from "../../../../shared/model/event-type";
import {combineLatest, Observable, Subject} from "rxjs";
import {ParticipantListOption} from "./participants-category-selection/participants-category-selection.component";
import {EventService} from "../../../../../shared/services/api/event.service";
import {FormControl} from "@angular/forms";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {OrderStatusIntList} from "../../../../../shared/model/order-status";


@Component({
	selector: "memo-participant-list",
	templateUrl: "./participant-list.component.html",
	styleUrls: ["./participant-list.component.scss"],
	providers: [ParticipantListService]
})
export class ParticipantListComponent implements OnInit, OnDestroy {
	showCancelledFormControl = new FormControl(
		this.activatedRoute.snapshot.queryParamMap.has("showCancelled")
			? this.activatedRoute.snapshot.queryParamMap.get("showCancelled") === "true"
			: false
	);

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
		this.participantListService.eventInfo$,
		this.activatedRoute.queryParamMap,
	)
		.pipe(
			map(([view, info, queryParamMap]: [ParticipantListOption, { eventType: EventType, eventId: number }, ParamMap]) => {
				let viewFilters = Filter.none();
				switch (view) {
					case "needsTicket":
						viewFilters = Filter.by({needsTicket: "true"});
						break;
					case "isDriver":
						viewFilters = Filter.by({isDriver: "true"});
				}

				let showCancelledFilter = Filter.none();
				if (!queryParamMap.has("showCancelled") || queryParamMap.get("showCancelled") === "false") {
					showCancelledFilter = Filter.by({
						status: OrderStatusIntList.filter(it => it !== 5).join(",")
					})
				}


				return Filter.combine(
					Filter.by({"eventId": "" + info.eventId}),
					showCancelledFilter,
					viewFilters
				)
			}),
		);

	additionalItemInfo$: Observable<{ title: string; }> = this.participantListService.eventInfo$.pipe(
		switchMap(eventInfo => {
			return this.eventService.getById(eventInfo.eventId).pipe(
				map(item => ({
					title: item.title,
				}))
			)
		})
	);


	onDestroy$ = new Subject();

	constructor(public participantListService: ParticipantListService,
				public participantUserService: ParticipantUserService,
				public breakpointObserver: BreakpointObserver,
				private eventService: EventService,
				private router: Router,
				private activatedRoute: ActivatedRoute,
				public userService: UserService) {
		this.participantListService.dataSource = this.dataSource;

		this.showCancelledFormControl.valueChanges.pipe(takeUntil(this.onDestroy$))
			.subscribe(showCancelled =>
				this.router.navigate([], {queryParams: {showCancelled}, queryParamsHandling: "merge"})
			)
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
		this.onDestroy$.next(true);
	}


}
