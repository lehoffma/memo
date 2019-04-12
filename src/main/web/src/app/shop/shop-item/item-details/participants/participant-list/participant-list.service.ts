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
import {CapacityService, EventCapacity} from "../../../../../shared/services/api/capacity.service";
import {ActionPermissions} from "../../../../../shared/utility/material-table/util/action-permissions";
import {ParticipantDataSource} from "./participant-data-source";
import {ParticipantListOption} from "./participants-category-selection/participants-category-selection.component";

export interface EventInfo {
	eventType: EventType,
	eventId: number
}

@Injectable()
export class ParticipantListService extends ExpandableTableContainerService<ParticipantUser> {
	dataSource: ParticipantDataSource;

	eventInfo$: Observable<EventInfo> = this.activatedRoute.url
		.pipe(
			map((urls: UrlSegment[]) => {
				// "tours/:id/participants"
				// "partys/:id/participants"
				//shop/partys/1/participants?page=1&pageSize=20
				let eventType = EventType[urls[1].path];
				let eventId = +urls[2].path;

				return {eventType, eventId};
			})
		);

	view$: Observable<ParticipantListOption> = this.activatedRoute.queryParamMap
		.pipe(
			map((queryParamMap) => {
				if (!queryParamMap.has("view")) {
					return "participated";
				}

				const view = queryParamMap.get("view");
				if (!(["participated", "isDriver", "needsTicket"].includes(view))) {
					return ["participated"];
				}

				return view as any;
			})
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
							//shop/partys/1/participants?page=1&pageSize=20
							let eventType = EventType[urls[1].path];
							let eventId = +urls[2].path;

							return this.capacityService.valueChanges<EventCapacity>(eventId)
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

		this.actionHandlers["editMultiple"] = this.editMultiple.bind(this);

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


	editMultiple(entries: ParticipantUser[]): void {

		console.log(entries);
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
