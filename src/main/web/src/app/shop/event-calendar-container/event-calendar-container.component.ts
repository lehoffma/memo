import {Component, OnDestroy, OnInit} from "@angular/core";
import {EventService} from "../../shared/services/api/event.service";
import {EventType, integerToType, typeToInteger} from "../shared/model/event-type";
import {MatDialog, MatSnackBar} from "@angular/material";
import {EventContextMenuComponent} from "./event-context-menu/event-context-menu.component";
import {CreateEventContextMenuComponent} from "./create-event-context-menu/create-event-context-menu.component";
import {LogInService} from "../../shared/services/api/login.service";
import {EventUtilityService} from "../../shared/services/event-utility.service";
import {Permission, visitorPermissions} from "../../shared/model/permission";
import {isNullOrUndefined} from "util";
import {ActivatedRoute, Router} from "@angular/router";
import {BehaviorSubject, combineLatest, Observable, of} from "rxjs";
import {defaultIfEmpty, filter, map, mergeMap, startWith, tap} from "rxjs/operators";
import {Event} from "../shared/model/event";
import {Filter} from "../../shared/model/api/filter";
import {getMonth} from "date-fns";
import {Sort} from "../../shared/model/api/sort";
import {userPermissions} from "../../shared/model/user";
import {AddressService} from "../../shared/services/api/address.service";
import {addressToString} from "../../shared/model/util/to-string-util";
import {ParticipantUserService} from "../shop-item/item-details/participants/participant-list/participant-data-source";
import {ParticipantListService} from "../shop-item/item-details/participants/participant-list/participant-list.service";
import {PageRequest} from "../../shared/model/api/page-request";
import {Tour} from "../shared/model/tour";
import {Party} from "../shared/model/party";

@Component({
	selector: "memo-event-calendar-container",
	templateUrl: "./event-calendar-container.component.html",
	styleUrls: ["./event-calendar-container.component.scss"]
})
export class EventCalendarContainerComponent implements OnInit, OnDestroy {
	currentlySelectedMonth$ = new BehaviorSubject(getMonth(new Date()));
	events$: Observable<Event[]> = this.getUpdatedEvents();

	subscriptions = [];

	selectedView: "calendar" | "list" = "calendar";

	constructor(private eventService: EventService,
				private addressService: AddressService,
				private participantService: ParticipantUserService,
				private loginService: LogInService,
				private activatedRoute: ActivatedRoute,
				private router: Router,
				private snackBar: MatSnackBar,
				private mdDialog: MatDialog) {
	}

	ngOnInit() {
		this.subscriptions.push(
			this.activatedRoute.queryParamMap
				.pipe(
					filter(map => map.has("view"))
				)
				.subscribe(queryParamMap => {
					switch (queryParamMap.get("view")) {
						case "calendar":
							this.selectedView = "calendar";
							break;
						case "list":
							this.selectedView = "list";
							break;
						default:
							this.selectedView = "calendar";
					}
				})
		);
	}


	ngOnDestroy(): void {
		this.subscriptions.forEach(it => it.unsubscribe());
	}

	navigateToRoute(selectedView: "calendar" | "list") {
		this.router.navigate([], {
			queryParams: {
				view: selectedView.toString(),
			},
			relativeTo: this.activatedRoute,
			replaceUrl: !this.activatedRoute.snapshot.queryParamMap.has("view")
		});
	}

	updateMonth(date: Date) {
		this.currentlySelectedMonth$.next(getMonth(date));
	}

	getUpdatedEvents(): Observable<Event[]> {
		const noMerchFilter = Filter
			.by({"type": typeToInteger(EventType.tours) + "|" + typeToInteger(EventType.partys)});

		return this.eventService.getAll(
			noMerchFilter,
			Sort.none()
		);
	}

	/**
	 *
	 * @param event
	 */
	onEventClick(event: (Tour | Party)) {

		const permission$ = this.loginService.currentUser$
			.pipe(
				tap(it => console.log(it)),
				filter(user => user !== null),
				map(user => userPermissions(user)),
				filter(permissions => !isNullOrUndefined(permissions)),
				defaultIfEmpty(visitorPermissions),
				map((permissions) => {
					const eventType = integerToType(event.type);
					if (eventType === EventType.partys) {
						return permissions.party;
					}
					if (eventType === EventType.tours) {
						return permissions.tour;
					}
					return permissions.merch;
				})
			);

		const dialogRef = this.mdDialog.open(EventContextMenuComponent, {
			data: {
				id: event.id,
				event: of(event).pipe(
					mergeMap(event => this.addressService.getById(event.route[event.route.length - 1])
						.pipe(
							map(address => ({
								...event,
								destination: `${address.city}, ${address.country}`
							}))
						)
					),
					mergeMap(event => this.participantService.get(
						Filter.by({"eventId": "" + event.id}), PageRequest.first(5), Sort.none()).pipe(
							map(participantPage => ({
								...event,
								participantPage
							}))
						)
					),
					mergeMap(event => permission$.pipe(
						map(permission => ({
							...event,
							permission: {
								view: permission >= Permission.read,
								edit: permission >= Permission.write,
								remove: permission >= Permission.delete
							}
						}))
					))
				)
			}
		});

		dialogRef.afterClosed()
			.subscribe(value => {
					if (value === "deleted") {
						this.events$ = this.getUpdatedEvents();
						// this.subscriptions.push(this.events$.subscribe());
						this.snackBar.open("Löschen erfolgreich.", "Schließen", {
							duration: 1000
						});
					}
				}, console.error
			)
	}

	/**
	 *
	 * @param date
	 */
	onDayClick(date: Date = new Date()) {
		const permissions$ = this.loginService.currentUser$
			.pipe(
				filter(user => user !== null),
				map(user => userPermissions(user)),
				filter(permissions => !isNullOrUndefined(permissions)),
				defaultIfEmpty(visitorPermissions)
			);

		const dialogRef = this.mdDialog.open(CreateEventContextMenuComponent, {
			autoFocus: false,
			data: {
				date,
				tours: permissions$
					.pipe(map(permissions => permissions.tour >= Permission.create)),
				partys: permissions$
					.pipe(map(permissions => permissions.party >= Permission.create)),
				merch: of(false),
				show: {tours: true, partys: true, merch: false}
			}
		});
		dialogRef.afterClosed()
			.subscribe(console.log, console.error)
	}
}
