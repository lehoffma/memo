import {Component} from "@angular/core";
import {Party} from "../shared/model/party";
import {Observable} from "rxjs/Observable";
import {EventService} from "../../shared/services/event.service";
import {EventType} from "../shared/model/event-type";


@Component({
	selector: "memo-partys",
	templateUrl: "./partys.component.html",
	styleUrls: ["./partys.component.scss"]
})
export class PartysComponent {
	public partys: Observable<Party[]> = this.eventService.search("", {eventType: EventType.partys});

	constructor(private eventService: EventService) {

	}
}
