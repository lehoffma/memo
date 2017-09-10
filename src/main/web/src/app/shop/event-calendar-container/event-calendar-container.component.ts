import {Component, OnInit} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {Party} from "../shared/model/party";
import {Tour} from "../shared/model/tour";
import {EventService} from "../../shared/services/api/event.service";
import {EventType} from "../shared/model/event-type";
import {MdDialog, MdSnackBar} from "@angular/material";
import {EventContextMenuComponent} from "./event-context-menu/event-context-menu.component";
import {CreateEventContextMenuComponent} from "./create-event-context-menu/create-event-context-menu.component";
import {LogInService} from "../../shared/services/api/login.service";
import {EventUtilityService} from "../../shared/services/event-utility.service";
import {Permission, visitorPermissions} from "../../shared/model/permission";
import {isNullOrUndefined} from "util";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
	selector: "memo-event-calendar-container",
	templateUrl: "./event-calendar-container.component.html",
	styleUrls: ["./event-calendar-container.component.scss"]
})
export class EventCalendarContainerComponent implements OnInit {
	events: Observable<(Party | Tour)[]> = this.getUpdatedEvents();
	editable: Observable<boolean> = Observable.of(false); //todo true if permissions of tour/party >= write, else false

	selectedView = "calendar";

	constructor(private eventService: EventService,
				private loginService: LogInService,
				private activatedRoute: ActivatedRoute,
				private router: Router,
				private snackBar: MdSnackBar,
				private mdDialog: MdDialog) {
	}

	ngOnInit() {
		this.activatedRoute.queryParamMap
			.filter(queryParamMap => queryParamMap.has("view"))
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
	}

	navigateToRoute(selectedView: "calendar" | "list") {
		this.router.navigate([], {
			queryParams: {
				view: selectedView,
			},
			relativeTo: this.activatedRoute
		});
	}

	getUpdatedEvents(): Observable<(Party | Tour)[]> {
		return Observable.combineLatest(
			this.eventService.search("", EventType.tours),
			this.eventService.search("", EventType.partys),
			(tours, partys) => [...tours, ...partys]
		);
	}

	/**
	 *
	 * @param eventId
	 */
	onEventClick(eventId: number) {
		let observable = Observable.combineLatest(
			this.loginService.currentUser()
				.filter(user => user !== null)
				.map(user => user.userPermissions)
				.filter(permissions => !isNullOrUndefined(permissions))
				.defaultIfEmpty(visitorPermissions),
			this.eventService.getById(eventId)
				.map(event => EventUtilityService.getEventType(event))
				.filter(eventType => !isNullOrUndefined(eventType))
		);

		let permission$ = observable
			.map(([permissions, eventType]) => {
					if (eventType === EventType.partys) {
						return permissions.party;
					}
					if (eventType === EventType.tours) {
						return permissions.tour;
					}
					return permissions.merch;
				}
			);

		const dialogRef = this.mdDialog.open(EventContextMenuComponent, {
			data: {
				id: eventId,
				title: this.eventService.getById(eventId).map(event => event.title),
				eventType: observable.map(([permissions, eventType]) => eventType),
				view: permission$.map(permission => permission >= Permission.read),
				edit: permission$.map(permission => permission >= Permission.write),
				remove: permission$.map(permission => permission >= Permission.delete)
			}
		});

		dialogRef.afterClosed()
			.subscribe(value => {
					if (value === "deleted") {
						this.events = this.getUpdatedEvents();
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
	onDayClick(date: Date) {
		let permissions$ = this.loginService.currentUser()
			.filter(user => user !== null)
			.map(user => user.userPermissions)
			.filter(permissions => !isNullOrUndefined(permissions))
			.defaultIfEmpty(visitorPermissions);

		let dialogRef = this.mdDialog.open(CreateEventContextMenuComponent, {
			data: {
				date,
				tours: permissions$.map(permissions => permissions.tour >= Permission.create),
				partys: permissions$.map(permissions => permissions.party >= Permission.create)
			}
		});
		dialogRef.afterClosed()
			.subscribe(value => {

			}, console.error)
	}
}
