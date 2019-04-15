import {AfterViewInit, Component, OnDestroy, OnInit, TemplateRef, ViewChild} from "@angular/core";
import {ParticipantUser} from "../../../../shared/model/participant";
import {ParticipantListService} from "./participant-list.service";
import {RowAction, TableAction} from "../../../../../shared/utility/material-table/util/row-action";
import {ParticipantDataSource, ParticipantUserService} from "./participant-data-source";
import {UserService} from "../../../../../shared/services/api/user.service";
import {
	ExpandableMaterialTableComponent,
	TableColumn
} from "../../../../../shared/utility/material-table/expandable-material-table.component";
import {catchError, map, startWith, switchMap, takeUntil} from "rxjs/operators";
import {ResponsiveColumnsHelper} from "../../../../../shared/utility/material-table/responsive-columns.helper";
import {BreakpointObserver} from "@angular/cdk/layout";
import {Filter} from "../../../../../shared/model/api/filter";
import {EventType} from "../../../../shared/model/event-type";
import {combineLatest, Observable, Subject} from "rxjs";
import {ParticipantListOption} from "./participants-category-selection/participants-category-selection.component";
import {EventService} from "../../../../../shared/services/api/event.service";
import {FormControl, Validators} from "@angular/forms";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {OrderStatusIntList, OrderStatusPairList, orderStatusToString} from "../../../../../shared/model/order-status";
import {UserActionsService} from "../../../../../shared/services/user-actions.service";
import {
	BatchModifyParticipantComponent,
	BatchModifyParticipantOptions
} from "./batch-modify-participant/batch-modify-participant.component";
import {MatDialog, MatSnackBar} from "@angular/material";
import {OrderedItemService} from "../../../../../shared/services/api/ordered-item.service";
import {of} from "rxjs/internal/observable/of";


@Component({
	selector: "memo-participant-list",
	templateUrl: "./participant-list.component.html",
	styleUrls: ["./participant-list.component.scss"],
	providers: [ParticipantListService]
})
export class ParticipantListComponent implements OnInit, AfterViewInit, OnDestroy {
	showCancelledFormControl = new FormControl(
		this.activatedRoute.snapshot.queryParamMap.has("showCancelled")
			? this.activatedRoute.snapshot.queryParamMap.get("showCancelled") === "true"
			: false
	);

	rowActions$: Observable<RowAction<ParticipantUser>[]> = this.userActionsService.getUserActions<ParticipantUser>(T => T.user);

	selectedActions: TableAction<ParticipantUser>[] = [];

	@ViewChild("bulkEditingMenu") bulkEditingMenu: any;

	columns: TableColumn<ParticipantUser>[] = [
		{columnDef: "name", header: "Name", cell: element => element.user.firstName + " " + element.user.surname},
		{columnDef: "status", header: "Status", cell: element => orderStatusToString(element.status)},
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

	@ViewChild("statusInput") statusInput: TemplateRef<any>;
	availableStatus = OrderStatusPairList;
	statusFormControl = new FormControl(undefined, {validators: [Validators.required]});

	@ViewChild("isDriverInput") isDriverInput: TemplateRef<any>;
	isDriverFormControl = new FormControl();

	@ViewChild("needsTicketInput") needsTicketInput: TemplateRef<any>;
	needsTicketFormControl = new FormControl();

	@ViewChild("participantsTable") participantsTable: ExpandableMaterialTableComponent<ParticipantUser>;

	private bulkEditDialogOptions: BatchModifyParticipantOptions[];

	onDestroy$ = new Subject();

	constructor(public participantListService: ParticipantListService,
				public participantUserService: ParticipantUserService,
				private participantService: OrderedItemService,
				public breakpointObserver: BreakpointObserver,
				private userActionsService: UserActionsService,
				private matDialog: MatDialog,
				private eventService: EventService,
				private snackBar: MatSnackBar,
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

	ngAfterViewInit(): void {
		this.selectedActions = [
			{
				name: "editMultiple",
				label: "",
				icon: "edit",
				type: "mat-icon-menu",
				menu: this.bulkEditingMenu,
				tooltip: "Batchbearbeitung",
			}
		];

		this.bulkEditDialogOptions = [
			{
				label: "Status",
				subtitle: "Diese Aktion wird den Status aller ausgewählten Einträge auf den neuen Wert ändern.",
				formField: this.statusInput,
				formControl: this.statusFormControl,
				withFormLabel: true,
			},
			{
				label: "Fahrer",
				subtitle: "Diese Aktion wird den Fahrerzustand aller ausgewählten Einträge auf den neuen Wert ändern.",
				formField: this.isDriverInput,
				formControl: this.isDriverFormControl,
				withFormLabel: false,
			},
			{
				label: "Stadion Ticket",
				subtitle: "Diese Aktion wird den Ticketwunsch aller ausgewählten Einträge auf den neuen Wert ändern.",
				formField: this.needsTicketInput,
				formControl: this.needsTicketFormControl,
				withFormLabel: false,
			}
		]
	}

	openBulkEdit(property: string) {
		let indices = ["status", "isDriver", "needsTicket"];
		let option: BatchModifyParticipantOptions = this.bulkEditDialogOptions[indices.indexOf(property)];
		this.matDialog.open(BatchModifyParticipantComponent, {data: option, autoFocus: false})
			.afterClosed()
			.subscribe(submitted => {
				if (!submitted) {
					return;
				}

				const selectedRows = this.participantsTable.selection.selected;
				console.log("Change " + property + " to " + option.formControl.value, selectedRows);

				combineLatest(
					...selectedRows
						.map(it => ({
							...it,
							[property]: option.formControl.value
						}))
						.map(it => this.participantService.modifyParticipant(it)
							.pipe(
								catchError(error => {
									console.error(error);
									this.snackBar.open("Nicht alle Änderungen konnten gesichert werden. Die Konsole beinhaltet mehr Informationen.");
									return of(null);
								})
							)
						)
				)
					.subscribe(() => {
						this.participantsTable.selection.clear();
						this.dataSource.reload();
					});
			})
	}

}
