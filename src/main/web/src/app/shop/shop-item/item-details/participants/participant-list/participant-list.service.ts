import {EventEmitter, Injectable} from "@angular/core";
import {ExpandableTableContainerService} from "../../../../../shared/utility/expandable-table/expandable-table-container.service";
import {ParticipantUser} from "../../../../shared/model/participant";
import {ColumnSortingEvent} from "../../../../../shared/utility/expandable-table/column-sorting-event";
import {attributeSortingFunction, sortingFunction, SortingFunction} from "../../../../../util/util";
import {LogInService} from "../../../../../shared/services/api/login.service";
import {MatDialog} from "@angular/material";
import {ActivatedRoute, UrlSegment} from "@angular/router";
import {filter, first, map, mergeMap, tap} from "rxjs/operators";
import {EventType} from "../../../../shared/model/event-type";
import {OrderedItemService} from "../../../../../shared/services/api/ordered-item.service";
import {ExpandableTableColumn} from "../../../../../shared/utility/expandable-table/expandable-table-column";
import {OrderStatusTableCellComponent} from "../order-status-table-cell.component";
import {BooleanCheckMarkCellComponent} from "../../../../../shared/utility/material-table/cells/boolean-checkmark-cell.component";
import {FullNameTableCellComponent} from "./full-name-table-cell.component";
import {Dimension, WindowService} from "../../../../../shared/services/window.service";
import {Observable} from "rxjs/Observable";
import {ModifyParticipantComponent} from "./modify-participant/modify-participant.component";
import {EventService} from "../../../../../shared/services/api/event.service";
import {UserService} from "../../../../../shared/services/api/user.service";
import {combineLatest} from "rxjs/observable/combineLatest";
import {CapacityService} from "../../../../../shared/services/api/capacity.service";
import {ActionPermissions} from "../../../../../shared/utility/expandable-table/expandable-table.component";


const participantListColumns: { [key: string]: ExpandableTableColumn<ParticipantUser> } = {
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

	loading = false;

	constructor(private loginService: LogInService,
				private activatedRoute: ActivatedRoute,
				private userService: UserService,
				private capacityService: CapacityService,
				private participantService: OrderedItemService,
				private windowService: WindowService,
				private eventService: EventService,
				private dialog: MatDialog,
	) {
		super(
			{
				key: "user",
				descending: true
			},
			combineLatest(
				loginService.getActionPermissions("party", "tour"),
				activatedRoute.url
					.pipe(
						mergeMap((urls: UrlSegment[]) => {
							// "tours/:id/participants"
							// "partys/:id/participants"
							let eventType = EventType[urls[0].path];
							let eventId = +urls[1].path;

							return this.capacityService.valueChanges(eventId)
						}),
						filter(it => it !== null),
						map(it => it.capacity > 0)
					)
			).pipe(
				map(([actionPermissions, canAdd]: [ActionPermissions, boolean]) => {
					let permissions: ActionPermissions = {...actionPermissions};

					permissions.Hinzufuegen = permissions.Hinzufuegen && canAdd;

					return permissions;
				})
			),
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

	/**
	 *
	 * @param {ParticipantUser} entry
	 * @returns {Observable<any>}
	 */
	openModifyDialog(entry?: ParticipantUser) {
		return this.eventInfo$
			.pipe(
				first(),
				//fetch the event object from the url parameters
				mergeMap(eventInfo => this.eventService.getById(eventInfo.eventId)
					.pipe(map(event => ({event, eventInfo})))
				),
				mergeMap(info =>
					this.dialog.open(ModifyParticipantComponent, {
						data: {
							participant: entry,
							associatedEventInfo: info.eventInfo,
							event: info.event
						}
					})
						.afterClosed()
						.pipe(
							//don't do anything if the user closed the dialog without confirmation
							filter(result => result),
							map(result => ({result, info}))
						)
				)
			);
	}

	/**
	 *
	 */
	add(): void {
		this.openModifyDialog()
			.pipe(
				mergeMap(({result, info}) => {
					this.loading = true;
					return this.participantService
						.addParticipant(result.participant, info.eventInfo.eventType, info.eventInfo.eventId);
				}),
				mergeMap(participant => this.userService.getByParticipantId(participant.id)
					.pipe(
						map(user => ({
							...participant,
							user,
						}))
					)),
				tap(participantUser => {
					this.dataSubject$.next([
						...this.dataSubject$.getValue(),
						participantUser
					])
				})
			)
			.subscribe(it => {
				this.participantsChanged.emit(this.dataSubject$.getValue());
				this.loading = false;
			}, error => {
				console.error(error);
				this.loading = false;
			})
	}

	/**
	 *
	 * @param {ParticipantUser} entry
	 */
	edit(entry: ParticipantUser): void {
		this.openModifyDialog(entry)
			.pipe(
				mergeMap(({result, info}) => {
					this.loading = true;
					return this.participantService
						.modifyParticipant(result.participant)
				}),
				mergeMap(participant => this.userService.getByParticipantId(participant.id)
					.pipe(
						map(user => ({
							...participant,
							user,
						}))
					)),
				tap(participantUser => {
					const indexOfParticipant = this.dataSubject$.value.findIndex(
						participant => participant.id === participantUser.id
					);
					this.dataSubject$.next([
						...this.dataSubject$.value.slice(0, indexOfParticipant),
						participantUser,
						...this.dataSubject$.value.slice(indexOfParticipant + 1)
					]);
				})
			)
			.subscribe(it => {
				this.participantsChanged.emit(this.dataSubject$.getValue());
				this.loading = false;
			}, error => {
				console.error(error);
				this.loading = false;
			})
	}

	/**
	 *
	 * @param {ParticipantUser[]} entries
	 */
	remove(entries: ParticipantUser[]): void {
		const loadingStatus = [...entries].map(it => false);
		this.loading = true;
		entries.forEach((participantUser, i) => {
			this.participantService
				.remove(participantUser.id)
				.subscribe(response => {
					loadingStatus[i] = true;
					const indexOfParticipant = this.dataSubject$.value.findIndex(
						participant => participant.id === participantUser.id
					);
					this.dataSubject$.next([
						...this.dataSubject$.value.slice(0, indexOfParticipant),
						...this.dataSubject$.value.slice(indexOfParticipant + 1)
					]);

					this.loading = !loadingStatus.every(it => it);
				}, error => {
					console.error(error);
					loadingStatus[i] = true;
					this.loading = !loadingStatus.every(it => it);
				})
		});
	}

	satisfiesFilter(entry: ParticipantUser, ...options): boolean {
		return true;
	}
}
