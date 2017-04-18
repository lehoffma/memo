import {Component, OnInit} from "@angular/core";
import {Merchandise} from "../shop/shared/model/merchandise";
import {Event} from "../shop/shared/model/event";
import {Observable} from "rxjs";
import {EventService} from "../shared/services/event.service";
import {EventType} from "../shop/shared/model/event-type";

interface EventsPreview {
	title: string,
	route: string,
	events: Observable<Event[]>
}

@Component({
	selector: "memo-home",
	templateUrl: "./home.component.html",
	styleUrls: ["./home.component.scss"]
})
export class HomeComponent implements OnInit {
	events: EventsPreview[] = [];

	constructor(private eventService: EventService) {
	}

	ngOnInit(): void {
		//get up to 7 preview items per category
		this.events = [
			{
				title: "Touren",
				route: "tours",
				events: this.eventService.search("", {eventType: EventType.tours}).map(tours => tours.slice(0, 7))
			},
			{
				title: "Veranstaltungen",
				route: "partys",
				events: this.eventService.search("", {eventType: EventType.partys}).map(partys => partys.slice(0, 7))
			},
			{
				title: "Merchandise",
				route: "merch",
				events: this.eventService.search("", {eventType: EventType.merch}).map(merch => merch.slice(0, 7))
			},
		];
	}

}
