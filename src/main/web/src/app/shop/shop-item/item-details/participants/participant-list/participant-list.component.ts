import {Component, EventEmitter, HostListener, OnDestroy, OnInit, Output, Type} from "@angular/core";
import {ActivatedRoute, UrlSegment} from "@angular/router";
import {ParticipantUser} from "../../../../shared/model/participant";
import {EventType} from "../../../../shared/model/event-type";
import {ParticipantsService} from "../../../../../shared/services/api/participants.service";
import {ExpandableTableColumn} from "../../../../../shared/expandable-table/expandable-table-column";
import {BooleanCheckMarkCellComponent} from "../../../../../club-management/administration/member-list/member-list-table-cells/boolean-checkmark-cell.component";
import {ColumnSortingEvent} from "../../../../../shared/expandable-table/column-sorting-event";
import {attributeSortingFunction, sortingFunction} from "../../../../../util/util";
import {FullNameTableCellComponent} from "app/shop/shop-item/item-details/participants/participant-list/full-name-table-cell.component";
import {SingleValueListExpandedRowComponent} from "../../../../../shared/expandable-table/single-value-list-expanded-row/single-value-list-expanded-row.component";
import {ExpandedRowComponent} from "../../../../../shared/expandable-table/expanded-row.component";
import {MatDialog} from "@angular/material";
import {
	ModifyParticipantComponent,
	ModifyParticipantEvent
} from "app/shop/shop-item/item-details/participants/participant-list/modify-participant/modify-participant.component";
import {EventService} from "../../../../../shared/services/api/event.service";
import {ActionPermissions} from "../../../../../shared/expandable-table/expandable-table.component";
import {LogInService} from "../../../../../shared/services/api/login.service";
import {TableActionEvent} from "../../../../../shared/expandable-table/table-action-event";
import {RowAction} from "../../../../../shared/expandable-table/row-action";
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {filter, first, map, mergeMap, tap} from "rxjs/operators";
import {combineLatest} from "rxjs/observable/combineLatest";
import {Subscription} from "rxjs/Subscription";
import {OrderStatusTableCellComponent} from "../order-status-table-cell.component";

const participantListColumns = {
	name: new ExpandableTableColumn<ParticipantUser>("Name", "user", FullNameTableCellComponent),
	status: new ExpandableTableColumn<ParticipantUser>("Status", "status", OrderStatusTableCellComponent),
	isDriver: new ExpandableTableColumn<ParticipantUser>("Fahrer", "isDriver", BooleanCheckMarkCellComponent),
	needsTicket: new ExpandableTableColumn<ParticipantUser>("Benötigt Ticket", "needsTicket", BooleanCheckMarkCellComponent),
};

@Component({
	selector: "memo-participant-list",
	templateUrl: "./participant-list.component.html",
	styleUrls: ["./participant-list.component.scss"]
})
export class ParticipantListComponent implements OnInit, OnDestroy {
	//todo use table.service
	eventInfo: Observable<{
		eventType: EventType,
		eventId: number
	}> = this.activatedRoute.url
		.pipe(
			map((urls: UrlSegment[]) => {
				// "tours/:id/participants"
				// "partys/:id/participants"
				let eventType = EventType[urls[0].path];
				let eventId = +urls[1].path;

				return {eventType, eventId};
			})
		);

	eventTitle = this.eventInfo
		.pipe(
			mergeMap(eventInfo => this.eventService.getById(eventInfo.eventId)),
			map(event => event.title)
		);
	expandedRowComponent: Type<ExpandedRowComponent<any>> = SingleValueListExpandedRowComponent;
	participants$ = new BehaviorSubject<ParticipantUser[]>([]);
	participantList = this.participants$;
	permissions$: Observable<ActionPermissions> = this.loginService.getActionPermissions("party", "tour");
	private _columnKeys: BehaviorSubject<ExpandableTableColumn<ParticipantUser>[]> = new BehaviorSubject([
		participantListColumns.name, participantListColumns.status,
		participantListColumns.isDriver, participantListColumns.needsTicket
	]);
	columnKeys = this._columnKeys.asObservable();
	private _expandedKeys: BehaviorSubject<ExpandableTableColumn<ParticipantUser>[]> = new BehaviorSubject([]);
	expandedKeys = this._expandedKeys.asObservable();
	isExpandable = this.expandedKeys
		.pipe(map(keys => keys.length > 0));
	private _sortBy$: BehaviorSubject<ColumnSortingEvent<ParticipantUser>> =
		new BehaviorSubject<ColumnSortingEvent<ParticipantUser>>({
			key: "user",
			descending: true
		});
	sortBy$ = this._sortBy$.asObservable();

	subscriptions: Subscription[] = [];

	@Output() participantsChanged: EventEmitter<ParticipantUser[]> = new EventEmitter<ParticipantUser[]>();

	constructor(private activatedRoute: ActivatedRoute,
				private dialog: MatDialog,
				private loginService: LogInService,
				private eventService: EventService,
				private participantService: ParticipantsService) {
	}

	ngOnInit() {
		this.updateColumnKeys(window.innerWidth);
		this.subscriptions.push(
			this.getParticipants().subscribe(this.participants$),
			this.participants$.subscribe(value => this.participantsChanged.emit(value))
		);
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(it => it.unsubscribe());
	}

	updateSortBy(event: ColumnSortingEvent<ParticipantUser>) {
		this._sortBy$.next(event);
	}


	/**
	 * Updated die column keys abhängig von der übergebenen screen width.
	 * Je höher die Breite des Bildschirms, desto mehr keys werden in den main rows angezeigt
	 * @param screenWidth
	 */
	updateColumnKeys(screenWidth: number) {
		let newColumns: ExpandableTableColumn<ParticipantUser>[] = [
			participantListColumns.name,

			participantListColumns.status
		];
		if (screenWidth > 500) {
			newColumns.push(participantListColumns.isDriver);
		}
		if (screenWidth > 700) {
			newColumns.push(participantListColumns.needsTicket);
		}
		this._columnKeys.next(newColumns);
		this._expandedKeys.next(Object.keys(participantListColumns)
			.filter(key => !newColumns.includes(participantListColumns[key]))
			.map(key => participantListColumns[key]))
	}

	@HostListener("window:resize", ["$event"])
	onResize(event) {
		this.updateColumnKeys(event.target.innerWidth);
	}


	/**
	 *
	 * @returns {Observable<any>}
	 */
	getParticipants() {
		return combineLatest(
			this.sortBy$,
			this.activatedRoute.url
				.pipe(
					mergeMap((urls: UrlSegment[]) => {
						// "tours/:id/participants"
						// "partys/:id/participants"
						let eventType = EventType[urls[0].path];
						let eventId = +urls[1].path;

						return this.participantService.getParticipantUsersByEvent(eventId, eventType);
					}))
		)
			.pipe(
				map(([sortBy, participants]) => {
					if (sortBy) {
						if (sortBy.key === "user") {
							return [...participants
								.sort(sortingFunction<ParticipantUser>(participant =>
									participant.user.surname, sortBy.descending))];
						}
						return [...participants
							.sort(attributeSortingFunction(sortBy.key, sortBy.descending))];
					}
					return [...participants];
				})
			);
	}

	/**
	 *
	 */
	addParticipant() {
		this.eventInfo
			.pipe(
				first(),
				mergeMap(eventInfo => {
					return this.eventService.getById(eventInfo.eventId)
						.pipe(
							map(event => ({event, eventInfo}))
						)
				})
			)
			//todo add event to data object
			.subscribe(info => {
				this.dialog.open(ModifyParticipantComponent, {
					data: {associatedEventInfo: info.eventInfo, event: info.event}
				})
					.afterClosed()
					.pipe(
						filter(result => result),
						mergeMap((result: ModifyParticipantEvent) => {
							return this.participantService
								.add(result.participant, info.eventInfo.eventType, info.eventInfo.eventId)
								.pipe(
									tap(() => {
										this.participants$.next([
											...this.participants$.getValue(),
											result.participant
										])
									})
								);
						})
					)
					.subscribe()
			})
	}

	/**
	 *
	 * @param event
	 */
	editParticipant(event) {
		this.eventInfo
			.pipe(
				first(),
				mergeMap(eventInfo => {
					return this.eventService.getById(eventInfo.eventId)
						.pipe(
							map(event => ({event, eventInfo}))
						)
				})
			)
			.subscribe(info => {
				this.dialog.open(ModifyParticipantComponent, {
					data: {
						participant: event,
						event: info.event,
						associatedEventInfo: info.eventInfo
					}
				})
					.afterClosed()
					.pipe(
						filter(result => result),
						mergeMap((result: ModifyParticipantEvent) => {
							return this.participantService
								.modify(result.participant, info.eventInfo.eventType, info.eventInfo.eventId)
								.pipe(
									tap(() => {
										let indexOfParticipant = this.participants$.value.findIndex(
											participant => participant.user.id === result.participant.id
										);
										this.participants$.next([
											...this.participants$.value.slice(0, indexOfParticipant),
											result.participant,
											...this.participants$.value.slice(indexOfParticipant + 1)
										]);
									})
								);
						})
					)
					.subscribe()
			})
	}

	/**
	 *
	 * @param event
	 */
	deleteParticipant(event: ParticipantUser[]) {
		this.eventInfo.pipe(first()).subscribe(eventInfo => {
			event.forEach(participantUser => {
				this.participantService
					.remove(participantUser.id, eventInfo.eventType, eventInfo.eventId)
					.subscribe(response => {
						let indexOfParticipant = this.participants$.value.findIndex(
							participant => participant.user.id === participantUser.id
						);
						this.participants$.next([
							...this.participants$.value.slice(0, indexOfParticipant),
							...this.participants$.value.slice(indexOfParticipant + 1)
						]);
					});
			});
		})
	}

	handleParticipantAction(event: TableActionEvent<ParticipantUser>) {
		switch (event.action) {
			case RowAction.ADD:
				return this.addParticipant();
			case RowAction.EDIT:
				return this.editParticipant(event.entries[0]);
			case RowAction.DELETE:
				return this.deleteParticipant(event.entries);
		}
	}
}
