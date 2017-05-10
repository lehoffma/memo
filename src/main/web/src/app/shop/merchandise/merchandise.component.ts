import {Component} from "@angular/core";
import {EventService} from "../../shared/services/event.service";
import {Merchandise} from "../shared/model/merchandise";
import {Observable} from "rxjs/Observable";
import {EventType} from "../shared/model/event-type";


@Component({
	selector: "memo-merchandise",
	templateUrl: "./merchandise.component.html",
	styleUrls: ["./merchandise.component.scss"]
})
export class MerchandiseComponent {
	public merch: Observable<Merchandise[]> = this.eventService.search("", {eventType: EventType.merch});

	constructor(private eventService: EventService) {

	}
}
