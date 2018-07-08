import {Injectable} from "@angular/core";
import {ExpandableTableContainerService} from "../../../../../shared/utility/material-table/util/expandable-table-container.service";
import {ParticipantUser} from "../../../../shared/model/participant";
import {LogInService} from "../../../../../shared/services/api/login.service";
import {MatDialog} from "@angular/material";
import {ActivatedRoute, UrlSegment} from "@angular/router";
import {filter, first, map, mergeMap} from "rxjs/operators";
import {EventType} from "../../../../shared/model/event-type";
import {OrderedItemService} from "../../../../../shared/services/api/ordered-item.service";
import {WindowService} from "../../../../../shared/services/window.service";
import {combineLatest, Observable} from "rxjs";
import {ModifyParticipantComponent} from "./modify-participant/modify-participant.component";
import {EventService} from "../../../../../shared/services/api/event.service";
import {UserService} from "../../../../../shared/services/api/user.service";
import {CapacityService} from "../../../../../shared/services/api/capacity.service";
import {ActionPermissions} from "../../../../../shared/utility/material-table/util/action-permissions";
import {ParticipantDataSource} from "./participant-data-source";


@Injectable()
export class ParticipantListService extends ExpandableTableContainerService<ParticipantUser> {
	dataSource: ParticipantDataSource;

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
				private userService: UserService,
				private capacityService: CapacityService,
				private participantService: OrderedItemService,
				private windowService: WindowService,
				private eventService: EventService,
				private dialog: MatDialog,
	) {
		super(
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
					let permissions: ActionPermissions = {...actionPermissions} as ActionPermissions;

					permissions.Hinzufuegen = permissions.Hinzufuegen && canAdd;

					return permissions;
				})
			)
		);

	}

	/**
	 *
	 * @param {ParticipantUser} entry
	 * @returns {Observable<any>}
	 */
	openModifyDialog(entry?: ParticipantUser) {
		return this.eventInfo$.pipe(
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
		this.openModifyDialog().pipe(
			mergeMap(({result, info}) => {
				return this.participantService
					.addParticipant(result.participant, info.eventInfo.eventType, info.eventInfo.eventId);
			})
		)
			.subscribe(it => {
				this.dataSource.reload();
			}, error => {
				console.error(error);
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
					return this.participantService
						.modifyParticipant(result.participant)
				}),
			)
			.subscribe(it => {
				this.dataSource.reload();
			}, error => {
				console.error(error);
			})
	}

	/**
	 *
	 * @param {ParticipantUser[]} entries
	 */
	remove(entries: ParticipantUser[]): void {
		entries.forEach((participantUser, i) => {
			this.participantService
				.remove(participantUser.id)
				.subscribe(response => {
					this.dataSource.reload();
				}, error => {
					console.error(error);
				})
		});
	}
}
