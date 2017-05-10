import {Component, Input, OnInit} from "@angular/core";
import {Event} from "../../../shop/shared/model/event";
import {Observable} from "rxjs/Observable";
import {NavigationService} from "../../../shared/services/navigation.service";
import {EventType} from "../../../shop/shared/model/event-type";
import {EventUtilityService} from "../../../shared/services/event-utility.service";

@Component({
	selector: "memo-participated-tours-preview",
	templateUrl: "./participated-tours-preview.component.html",
	styleUrls: ["./participated-tours-preview.component.scss"]
})
export class ParticipatedToursPreviewComponent implements OnInit {
	@Input() userEvents: Observable<Event[]>;

	constructor(private navigationService: NavigationService,
				private eventUtilService: EventUtilityService) {
	}

	ngOnInit() {
	}

	showEvent(recentEvent: Event) {
		const eventType: EventType = this.eventUtilService.getEventType(recentEvent);
		this.navigationService.navigateByUrl(`${eventType}/${recentEvent.id}`);
	}

}
