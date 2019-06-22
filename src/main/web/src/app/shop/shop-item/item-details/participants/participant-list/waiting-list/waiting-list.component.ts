import {AfterViewInit, Component, OnInit, TemplateRef, ViewChild} from "@angular/core";
import {catchError, map, startWith} from "rxjs/operators";
import {RowAction, TableAction} from "../../../../../../shared/utility/material-table/util/row-action";
import {
	ExpandableMaterialTableComponent,
	TableColumn
} from "../../../../../../shared/utility/material-table/expandable-material-table.component";
import {BreakpointObserver} from "@angular/cdk/layout";
import {UserService} from "../../../../../../shared/services/api/user.service";
import {ResponsiveColumnsHelper} from "../../../../../../shared/utility/material-table/responsive-columns.helper";
import {ParticipantListActions, WaitingListTableService} from "./waiting-list-table.service";
import {WaitingListDataSource, WaitingListUserService} from "./waiting-list-data-source";
import {EventType} from "../../../../../shared/model/event-type";
import {Filter} from "../../../../../../shared/model/api/filter";
import {WaitingListUser} from "../../../../../shared/model/waiting-list";
import {ActivatedRoute} from "@angular/router";
import {combineLatest, Observable, of} from "rxjs";
import {ParticipantListOption} from "../participants-category-selection/participants-category-selection.component";
import {UserActionsService} from "../../../../../../shared/services/user-actions.service";
import {
	BatchModifyParticipantComponent,
	BatchModifyParticipantOptions
} from "../batch-modify-participant/batch-modify-participant.component";
import {FormControl, Validators} from "@angular/forms";
import {MatDialog} from "@angular/material/dialog";
import {MatSnackBar} from "@angular/material/snack-bar";
import {WaitingListService} from "../../../../../../shared/services/api/waiting-list.service";
import {ParticipantListService} from "../participant-list.service";
import {RowActionType} from "../../../../../../shared/utility/material-table/util/row-action-type";

@Component({
	selector: "memo-waiting-list",
	templateUrl: "./waiting-list.component.html",
	styleUrls: ["./waiting-list.component.scss"],
	providers: [
		WaitingListTableService
	]
})
export class WaitingListComponent implements OnInit, AfterViewInit {
	rowActions$: Observable<RowAction<WaitingListUser>[]> = this.userActionsService.getUserActions<WaitingListUser>(
		T => T.user,
		true,
		(canRead, canEdit, canRemove) => {
			return {
				name: ParticipantListActions.TRANSFER_TO_PARTICIPANTS,
				icon: "compare_arrows",
				predicate: () => canEdit,
			}
		},
	).pipe(
		map(actions => {
			const editAction = actions.find(action => action.name === RowActionType.EDIT);

			editAction.link = undefined;
			editAction.route = undefined;

			return [
				editAction,
				...actions.filter(action => action.name !== RowActionType.EDIT)
			]
		})
	);

	selectedActions: TableAction<WaitingListUser>[] = [];

	@ViewChild("bulkEditingMenu", {static: true}) bulkEditingMenu: any;

	columns: TableColumn<WaitingListUser>[] = [
		{columnDef: "name", header: "Name", cell: element => element.user.firstName + " " + element.user.surname},
		...this.getAdditionalColumns()
	];
	displayedColumns$ = this.getDisplayedColumns();

	dataSource = new WaitingListDataSource(this.waitingListUserService, this.userService);


	filter$ = combineLatest(
		this.waitingListTableService.view$,
		this.waitingListTableService.eventInfo$
	)
		.pipe(
			map(([view, info]: [ParticipantListOption, { eventType: EventType, eventId: number }]) => {
				let viewFilters = Filter.none();
				if (info.eventType !== EventType.merch) {
					switch (view) {
						case "needsTicket":
							viewFilters = Filter.by({needsTicket: "true"});
							break;
						case "isDriver":
							viewFilters = Filter.by({isDriver: "true"});
					}
				}

				return Filter.combine(
					Filter.by({"eventId": "" + info.eventId}),
					viewFilters
				)
			}),
		);


	@ViewChild("waitingListTable", {static: true}) waitingListTable: ExpandableMaterialTableComponent<WaitingListUser>;

	batchEditOptions: BatchModifyParticipantOptions[] = [];
	@ViewChild("isDriverInput", {static: true}) isDriverInput: TemplateRef<any>;
	isDriverFormControl = new FormControl();

	@ViewChild("needsTicketInput", {static: true}) needsTicketInput: TemplateRef<any>;
	needsTicketFormControl = new FormControl();

	@ViewChild("colorInput", {static: true}) colorInput: TemplateRef<any>;
	colorFormControl = new FormControl(undefined, {validators: [Validators.required]});

	@ViewChild("sizeInput", {static: false}) sizeInput: TemplateRef<any>;
	sizeFormControl = new FormControl(undefined, {validators: [Validators.required]});

	constructor(public waitingListTableService: WaitingListTableService,
				public waitingListUserService: WaitingListUserService,
				private waitingListService: WaitingListService,
				private participantListService: ParticipantListService,
				private userActionsService: UserActionsService,
				private matDialog: MatDialog,
				private snackBar: MatSnackBar,
				private activatedRoute: ActivatedRoute,
				public breakpointObserver: BreakpointObserver,
				public userService: UserService) {
		this.waitingListTableService.dataSource = this.dataSource;
	}

	ngOnInit() {

	}

	getDisplayedColumns() {
		let urlSegments = this.activatedRoute.snapshot.url;
		const eventType = urlSegments[1].path as EventType;
		const columnHelper = new ResponsiveColumnsHelper(this.columns, this.breakpointObserver);

		if (eventType === EventType.merch) {
			columnHelper.addPixelBreakpoint(500, "color");
			columnHelper.addPixelBreakpoint(700, "size");
		} else if (eventType === EventType.tours) {
			columnHelper.addPixelBreakpoint(500, "isDriver");
			columnHelper.addPixelBreakpoint(700, "needsTicket");
		}

		return columnHelper.build()
			.pipe(startWith(columnHelper.getAlwaysAvailableColumndefs()));
	}

	ngOnDestroy(): void {

	}


	private getAdditionalColumns(): TableColumn<WaitingListUser>[] {
		let urlSegments = this.activatedRoute.snapshot.url;
		const eventType = urlSegments[1].path as EventType;
		if (eventType === EventType.merch) {
			return [
				{columnDef: "color", header: "Farbe", cell: element => element.color, type: "color"},
				{columnDef: "size", header: "Größe", cell: element => element.size}
			]
		} else if (eventType === EventType.tours) {
			return [
				{columnDef: "isDriver", header: "Ist Fahrer", cell: element => element.isDriver, type: "boolean"},
				{columnDef: "needsTicket", header: "Braucht Ticket", cell: element => element.needsTicket, type: "boolean"},
			]
		}
		return [];
	}

	ngAfterViewInit(): void {
		this.selectedActions = [
			{
				name: "editMultiple",
				label: "",
				icon: "edit",
				type: "mat-icon-menu",
				menu: this.bulkEditingMenu,
				tooltip: "Batchbearbeitung"
			}
		];


		this.batchEditOptions = [
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
			},
			//todo support merch waiting list
			// {
			// 	label: "Farbe",
			// 	subtitle: "Diese Aktion wird den Farbwunsch aller ausgewählten Einträge auf den neuen Wert ändern.",
			// 	formField: this.colorInput,
			// 	formControl: this.colorFormControl,
			// 	withFormLabel: true,
			// },
			// {
			// 	label: "Größe",
			// 	subtitle: "Diese Aktion wird den Größenwunsch aller ausgewählten Einträge auf den neuen Wert ändern.",
			// 	formField: this.sizeInput,
			// 	formControl: this.sizeFormControl,
			// 	withFormLabel: true,
			// }
		]
	}

	openBulkEdit(property: string) {
		let indices = [
			"isDriver", "needsTicket",
			//todo support merch waiting list
			// "color", "size"
		];
		let option: BatchModifyParticipantOptions = this.batchEditOptions[indices.indexOf(property)];
		this.matDialog.open(BatchModifyParticipantComponent, {data: option, autoFocus: false})
			.afterClosed()
			.subscribe(submitted => {
				if (!submitted) {
					return;
				}

				const selectedRows = this.waitingListTable.selection.selected;

				combineLatest(
					...selectedRows
						.map(it => ({
							...it,
							[property]: option.formControl.value,
							user: it.user.id,
						}))
						.map(it => this.waitingListService.modify(it)
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
						this.waitingListTable.selection.clear();
						this.dataSource.reload();
						this.participantListService.reloadStats();
					});
			})
	}
}
