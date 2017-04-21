import {Component} from "@angular/core";
import {EventService} from "../../shared/services/event.service";
import {Tour} from "../shared/model/tour";
import {Observable} from "rxjs/Observable";
import {EventType} from "../shared/model/event-type";

@Component({
	selector: "memo-tours",
	templateUrl: "./tours.component.html",
	styleUrls: ["./tours.component.scss"]
})
export class ToursComponent {
	public tours: Observable<Tour[]> = this.eventService.search("", {eventType: EventType.tours});

	constructor(private eventService: EventService) {
	}
}
