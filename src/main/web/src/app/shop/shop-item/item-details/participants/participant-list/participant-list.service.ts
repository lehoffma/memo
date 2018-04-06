import {EventEmitter, Injectable} from "@angular/core";
import {ExpandableTableContainerService} from "../../../../../shared/expandable-table/expandable-table-container.service";
import {ParticipantUser} from "../../../../shared/model/participant";
import {ColumnSortingEvent} from "../../../../../shared/expandable-table/column-sorting-event";
import {attributeSortingFunction, sortingFunction, SortingFunction} from "../../../../../util/util";
import {LogInService} from "../../../../../shared/services/api/login.service";
import {MatDialog} from "@angular/material";
import {ActivatedRoute, UrlSegment} from "@angular/router";
import {filter, first, map, mergeMap, tap} from "rxjs/operators";
import {EventType} from "../../../../shared/model/event-type";
import {ParticipantsService} from "../../../../../shared/services/api/participants.service";
import {ExpandableTableColumn} from "../../../../../shared/expandable-table/expandable-table-column";
import {OrderStatusTableCellComponent} from "../order-status-table-cell.component";
import {BooleanCheckMarkCellComponent} from "../../../../../club-management/administration/member-list/member-list-table-cells/boolean-checkmark-cell.component";
import {FullNameTableCellComponent} from "./full-name-table-cell.component";
import {Dimension, WindowService} from "../../../../../shared/services/window.service";
import {Observable} from "rxjs/Observable";
import {ModifyParticipantComponent, ModifyParticipantEvent} from "./modify-participant/modify-participant.component";
import {EventService} from "../../../../../shared/services/api/event.service";


const participantListColumns = {
	name: new ExpandableTableColumn<ParticipantUser>("Name", "user", FullNameTableCellComponent),
	status: new ExpandableTableColumn<ParticipantUser>("Status", "status", OrderStatusTableCellComponent),
	isDriver: new ExpandableTableColumn<ParticipantUser>("Fahrer", "isDriver", BooleanCheckMarkCellComponent),
	needsTicket: new ExpandableTableColumn<ParticipantUser>("Benötigt Ticket", "needsTicket", BooleanCheckMarkCellComponent),
};

@Injectable()
export class ParticipantListService extends ExpandableTableContainerService<ParticipantUser> {
	participantsChanged: EventEmitter<ParticipantUser[]> = new EventEmitter<ParticipantUser[]>();

	eventInfo$: Observable<{
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

	eventTitle = this.eventInfo$
		.pipe(
			mergeMap(eventInfo => this.eventService.getById(eventInfo.eventId)),
			map(event => event.title)
		);

	constructor(private loginService: LogInService,
				private activatedRoute: ActivatedRoute,
				private participantService: ParticipantsService,
				private windowService: WindowService,
				private eventService: EventService,
				private dialog: MatDialog,
	) {
		super(
			{
				key: "user",
				descending: true
			},
			loginService.getActionPermissions("party", "tour"),
			[]
		);

		this.init(this.getParticipants());
		this.windowService.dimension$
			.subscribe(dimensions => this.onResize(dimensions));
	}

	getParticipants() {
		return this.activatedRoute.url
			.pipe(
				mergeMap((urls: UrlSegment[]) => {
					// "tours/:id/participants"
					// "partys/:id/participants"
					let eventType = EventType[urls[0].path];
					let eventId = +urls[1].path;

					return this.participantService.getParticipantUsersByEvent(eventId, eventType);
				})
			)
	}

	onResize({width, height}: Dimension) {
		let newColumns: ExpandableTableColumn<ParticipantUser>[] = [
			participantListColumns.name,
			participantListColumns.status
		];
		if (width > 500) {
			newColumns.push(participantListColumns.isDriver);
		}
		if (width > 700) {
			newColumns.push(participantListColumns.needsTicket);
		}
		this.primaryColumnKeys$.next(newColumns);
		this.expandedRowKeys$.next(Object.keys(participantListColumns)
			.filter(key => !newColumns.includes(participantListColumns[key]))
			.map(key => participantListColumns[key]))
	}

	comparator(sortBy: ColumnSortingEvent<ParticipantUser>, ...options): SortingFunction<ParticipantUser> {
		if (sortBy.key === "user") {
			return sortingFunction<ParticipantUser>(participant =>
				participant.user.surname, sortBy.descending)
		}
		return attributeSortingFunction(sortBy.key, sortBy.descending);
	}

	add(): void {
		this.eventInfo$
			.pipe(
				first(),
				mergeMap(eventInfo => this.eventService.getById(eventInfo.eventId)
					.pipe(map(event => ({event, eventInfo})))
				),
				mergeMap(info =>
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
										tap(() =>
											this.dataSubject$.next([
												...this.dataSubject$.getValue(),
												result.participant
											])
										)
									);
							})
						))
			)
			.subscribe(it => this.participantsChanged.emit(this.dataSubject$.getValue()))
	}

	edit(entry: ParticipantUser): void {
		this.eventInfo$
			.pipe(
				first(),
				mergeMap(eventInfo => this.eventService.getById(eventInfo.eventId)
					.pipe(
						map(event => ({event, eventInfo}))
					)
				),
				mergeMap(info =>
					this.dialog.open(ModifyParticipantComponent, {
						data: {
							participant: entry,
							event: info.event,
							associatedEventInfo: info.eventInfo
						}
					})
						.afterClosed()
						.pipe(
							filter(result => result),
							mergeMap((result: ModifyParticipantEvent) => this.participantService
								.modify(result.participant, info.eventInfo.eventType, info.eventInfo.eventId)
								.pipe(
									tap(() => {
										const indexOfParticipant = this.dataSubject$.value.findIndex(
											participant => participant.id === result.participant.id
										);
										this.dataSubject$.next([
											...this.dataSubject$.value.slice(0, indexOfParticipant),
											result.participant,
											...this.dataSubject$.value.slice(indexOfParticipant + 1)
										]);
									})
								))
						))
			)
			.subscribe(it => this.participantsChanged.emit(this.dataSubject$.getValue()))
	}

	remove(entries: ParticipantUser[]): void {
		this.eventInfo$.pipe(first()).subscribe(eventInfo => {
			entries.forEach(participantUser => {
				this.participantService
					.remove(participantUser.id, eventInfo.eventType, eventInfo.eventId)
					.subscribe(response => {
						const indexOfParticipant = this.dataSubject$.value.findIndex(
							participant => participant.id === participantUser.id
						);
						this.dataSubject$.next([
							...this.dataSubject$.value.slice(0, indexOfParticipant),
							...this.dataSubject$.value.slice(indexOfParticipant + 1)
						]);
					});
			});
		})
	}

	satisfiesFilter(entry: ParticipantUser, ...options): boolean {
		return true;
	}
}
