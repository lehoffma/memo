import {Component, OnInit} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {Party} from "../shared/model/party";
import {Tour} from "../shared/model/tour";
import {EventService} from "../../shared/services/event.service";
import {EventType} from "../shared/model/event-type";
import {MdDialog} from "@angular/material";
import {EventContextMenuComponent} from "./event-context-menu/event-context-menu.component";
import {CreateEventContextMenuComponent} from "./create-event-context-menu/create-event-context-menu.component";
import {LogInService} from "../../shared/services/login.service";
import {UserService} from "../../shared/services/user.service";
import {EventUtilityService} from "../../shared/services/event-utility.service";
import {Permission, visitorPermissions} from "../../shared/model/permission";
import {isNullOrUndefined} from "util";

@Component({
	selector: "memo-event-calendar-container",
	templateUrl: "./event-calendar-container.component.html",
	styleUrls: ["./event-calendar-container.component.scss"]
})
export class EventCalendarContainerComponent implements OnInit {
	events: Observable<(Party | Tour)[]> = Observable.combineLatest(
		this.eventService.search("", EventType.tours),
		this.eventService.search("", EventType.partys),
		(tours, partys) => [...tours, ...partys]
	);
	editable: Observable<boolean> = Observable.of(false); //todo true if permissions of tour/party >= write, else false

	constructor(private eventService: EventService,
				private loginService: LogInService,
				private userService: UserService,
				private mdDialog: MdDialog) {
	}

	ngOnInit() {
	}

	/**
	 *
	 * @param eventId
	 */
	onEventClick(eventId: number) {
		//todo
		//falls permissions ausreichen:
		//			dialog: ansehen, editieren, löschen
		//sonst:
		// 			zur detailseite des angeklickten events weiterleiten

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

		let dialogRef = this.mdDialog.open(EventContextMenuComponent, {
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
					console.log(value);
				}, console.error
			)
	}

	/**
	 *
	 * @param date
	 */
	onDayClick(date: Date) {
		//todo
		//falls permissions ausreichen:
		// 			auswahl fenster, was an diesem tag erstellt werden soll (party oder event)
		//sonst:
		//			nix

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
				console.log(value);
			}, console.error)
	}
}
