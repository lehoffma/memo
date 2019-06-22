import {Injectable, OnDestroy} from "@angular/core";
import {ExpandableTableContainerService} from "../../../../../../shared/utility/material-table/util/expandable-table-container.service";
import {WaitingListEntry, WaitingListUser} from "../../../../../shared/model/waiting-list";
import {ActivatedRoute, UrlSegment} from "@angular/router";
import {LogInService} from "../../../../../../shared/services/api/login.service";
import {combineLatest, Observable, of, Subject} from "rxjs";
import {catchError, filter, first, map, mergeMap, switchMap, takeUntil} from "rxjs/operators";
import {EventType} from "../../../../../shared/model/event-type";
import {EventInfo, ParticipantListService} from "../participant-list.service";
import {EventService} from "../../../../../../shared/services/api/event.service";
import {WaitingListDataSource} from "./waiting-list-data-source";
import {ParticipantListOption} from "../participants-category-selection/participants-category-selection.component";
import {ParticipantUser} from "../../../../../shared/model/participant";
import {ModifyParticipantComponent, ModifyParticipantEvent} from "../modify-participant/modify-participant.component";
import {MatDialog} from "@angular/material/dialog";
import {WaitingListService} from "../../../../../../shared/services/api/waiting-list.service";
import {MatSnackBar} from "@angular/material";
import {OrderedItemService} from "../../../../../../shared/services/api/ordered-item.service";
import {UserService} from "../../../../../../shared/services/api/user.service";
import {OrderStatus} from "../../../../../../shared/model/order-status";
import {ParticipantsOverviewService} from "../participants-overview.service";


export enum ParticipantListActions {
	TRANSFER_TO_PARTICIPANTS = "Auf Teilnehmerliste schieben"
}


@Injectable()
export class WaitingListTableService extends ExpandableTableContainerService<WaitingListUser> implements OnDestroy{
	dataSource: WaitingListDataSource;

	eventInfo$: Observable<EventInfo> = this.activatedRoute.url
		.pipe(
			map((urls: UrlSegment[]) => {
				// "/shop/tours/:id/waiting-list"
				// "/shop/partys/:id/waiting-list"
				// "/shop/merch/:id/waiting-list"
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
				private dialog: MatDialog,
				private participantListService: ParticipantListService,
				private eventService: EventService,
				private waitingListService: WaitingListService,
				private snackBar: MatSnackBar,
				private shopItemService: EventService,
				private userService: UserService,
				private participantOverviewService: ParticipantsOverviewService,
				private participantService: OrderedItemService,
				private activatedRoute: ActivatedRoute) {
		super(
			loginService.getActionPermissions("party", "tour")
		);

		this.participantOverviewService.watchReload("waiting-list").pipe(takeUntil(this.onDestroy$))
			.subscribe(() => {
				this.dataSource.reload();
			});

		this.actionHandlers[ParticipantListActions.TRANSFER_TO_PARTICIPANTS] = this.transferToParticipants.bind(this);
	}

	transferToParticipants(entries: WaitingListUser[]){
		if(!entries || entries.length === 0){
			return;
		}

		const handleError = (error: any) => {
			this.snackBar.open("Fehler beim Übertragen zur Teilnehmerliste!", "Okay", {duration: 5000});
			console.error(error);
			return of(null);
		};

		combineLatest(entries.map(entry =>
			this.waitingListService.remove(entry.id)
				.pipe(
					catchError(handleError),
					switchMap(() => {
						return this.shopItemService.getById(entry.shopItem)
							.pipe(
								switchMap((item) => this.participantService.addParticipant({
									user: entry.user,
									item,
									id: -1,
									size: entry.size,
									needsTicket: entry.needsTicket,
									isDriver: entry.isDriver,
									color: entry.color,
									status: OrderStatus.RESERVED,
									description: "",
									price: 0
								})),
								catchError(handleError),
							)
					})
				)
		)).subscribe(() => {
			this.participantOverviewService.reload("both");
		}, handleError)
	}

	add(): void {
		this.openModifyDialog().pipe(
			mergeMap(({result, info}) => {
				let entry: WaitingListEntry = {
					...result.entry,
					user: result.entry.user.id,
					shopItem: info.event.id
				};
				return this.waitingListService
					.add(entry);
			})
		)
			.subscribe(it => {
				this.participantOverviewService.reload("waiting-list");
			}, error => {
				console.error(error);
			})
	}


	edit(entry: WaitingListUser): void {
		this.openModifyDialog(entry).pipe(
			mergeMap(({result, info}) => {
				let entry: WaitingListEntry = {
					...result.entry,
					user: result.entry.user.id,
					shopItem: info.event.id
				};
				return this.waitingListService
					.modify(entry);
			})
		)
			.subscribe(it => {
				this.participantOverviewService.reload("waiting-list");
			}, error => {
				console.error(error);
			})
	}


	/**
	 *
	 * @param {ParticipantUser} entry
	 * @returns {Observable<any>}
	 */
	openModifyDialog(entry?: WaitingListUser) {
		return this.eventInfo$.pipe(
			first(),
			//fetch the event object from the url parameters
			mergeMap(eventInfo => this.eventService.getById(eventInfo.eventId)
				.pipe(map(event => ({event, eventInfo})))
			),
			mergeMap(info =>
				this.dialog.open(ModifyParticipantComponent, {
					data: {
						entry,
						associatedEventInfo: info.eventInfo,
						event: info.event,
						editingParticipant: false,
					}
				})
					.afterClosed()
					.pipe(
						//don't do anything if the user closed the dialog without confirmation
						filter(result => result),
						map((result: ModifyParticipantEvent) => ({
							result,
							info
						}))
					)
			)
		);
	}

	remove(entries: WaitingListUser[]): void {
		entries.forEach((participantUser, i) => {
			this.waitingListService
				.remove(participantUser.id)
				.subscribe(response => {
					this.participantOverviewService.reload("waiting-list");
				}, error => {
					console.error(error);
				})
		});
	}
}
