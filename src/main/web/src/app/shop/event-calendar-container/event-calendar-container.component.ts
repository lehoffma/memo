import {Component, OnInit} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {Party} from "../shared/model/party";
import {Tour} from "../shared/model/tour";
import {EventService} from "../../shared/services/event.service";
import {EventType} from "../shared/model/event-type";

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

	constructor(private eventService: EventService) {
	}

	ngOnInit() {
	}

	/**
	 *
	 * @param eventId
	 */
	onEventClick(eventId:number){
		//todo
		//falls permissions ausreichen:
		//			dialog: ansehen, editieren, löschen
		//sonst:
		// 			zur detailseite des angeklickten events weiterleiten
	}

	/**
	 *
	 * @param date
	 */
	onDayClick(date:Date){
		//todo
		//falls permissions ausreichen:
		// 			auswahl fenster, was an diesem tag erstellt werden soll (party oder event)
		//sonst:
		//			nix
	}
}
