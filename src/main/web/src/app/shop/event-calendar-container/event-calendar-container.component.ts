import {Component, OnDestroy, OnInit} from "@angular/core";
import {EventService} from "../../shared/services/api/event.service";
import {EventType} from "../shared/model/event-type";
import {MatDialog, MatSnackBar} from "@angular/material";
import {EventContextMenuComponent} from "./event-context-menu/event-context-menu.component";
import {CreateEventContextMenuComponent} from "./create-event-context-menu/create-event-context-menu.component";
import {LogInService} from "../../shared/services/api/login.service";
import {EventUtilityService} from "../../shared/services/event-utility.service";
import {Permission, visitorPermissions} from "../../shared/model/permission";
import {isNullOrUndefined} from "util";
import {ActivatedRoute, Router} from "@angular/router";
import {Observable} from "rxjs/Observable";
import {of} from "rxjs/observable/of";
import {defaultIfEmpty, filter, first, map} from "rxjs/operators";
import {forkJoin} from "rxjs/observable/forkJoin";
import {Event} from "../shared/model/event";
import {combineLatest} from "rxjs/observable/combineLatest";

@Component({
	selector: "memo-event-calendar-container",
	templateUrl: "./event-calendar-container.component.html",
	styleUrls: ["./event-calendar-container.component.scss"]
})
export class EventCalendarContainerComponent implements OnInit, OnDestroy {

	events$: Observable<Event[]> = this.getUpdatedEvents();
	editable: Observable<boolean> = of(false); //todo true if permissions of tour/party >= write, else false

	subscriptions = [this.events$.subscribe()];

	selectedView: "calendar" | "list" = "calendar";

	constructor(private eventService: EventService,
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
				view: selectedView,
			},
			relativeTo: this.activatedRoute,
			replaceUrl: !this.activatedRoute.snapshot.queryParamMap.has("view")
		});
	}

	getUpdatedEvents(): Observable<Event[]> {
		return forkJoin(
			this.eventService.search("", EventType.tours).pipe(first()),
			this.eventService.search("", EventType.partys).pipe(first())
		)
			.pipe(
				map(([tours, partys]) => [...tours, ...partys])
			)
	}

	/**
	 *
	 * @param eventId
	 */
	onEventClick(eventId: number) {
		const observable = combineLatest(
			this.loginService.currentUser$
				.pipe(
					filter(user => user !== null),
					map(user => user.userPermissions),
					filter(permissions => !isNullOrUndefined(permissions)),
					defaultIfEmpty(visitorPermissions)
				),
			this.eventService.getById(eventId)
				.pipe(
					map(event => EventUtilityService.getEventType(event)),
					filter(eventType => !isNullOrUndefined(eventType))
				)
		);

		const permission$ = observable
			.pipe(
				map(([permissions, eventType]) => {
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
				id: eventId,
				title: this.eventService.getById(eventId)
					.pipe(
						map(event => event.title)
					),
				eventType: observable
					.pipe(map(([permissions, eventType]) => eventType)),
				view: permission$
					.pipe(map(permission => permission >= Permission.read)),
				edit: permission$
					.pipe(map(permission => permission >= Permission.write)),
				remove: permission$
					.pipe(map(permission => permission >= Permission.delete))
			}
		});

		dialogRef.afterClosed()
			.subscribe(value => {
					if (value === "deleted") {
						this.events$ = this.getUpdatedEvents();
						this.subscriptions.push(this.events$.subscribe());
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
				map(user => user.userPermissions),
				filter(permissions => !isNullOrUndefined(permissions)),
				defaultIfEmpty(visitorPermissions)
			);

		const dialogRef = this.mdDialog.open(CreateEventContextMenuComponent, {
			data: {
				date,
				tours: permissions$
					.pipe(map(permissions => permissions.tour >= Permission.create)),
				partys: permissions$
					.pipe(map(permissions => permissions.party >= Permission.create))
			}
		});
		dialogRef.afterClosed()
			.subscribe(console.log, console.error)
	}
}
