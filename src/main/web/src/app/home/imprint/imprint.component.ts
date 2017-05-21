import {Component, OnInit} from "@angular/core";
import {UserService} from "../../shared/services/user.service";
import {EventService} from "../../shared/services/event.service";
import {EventType} from "../../shop/shared/model/event-type";

@Component({
	selector: "memo-imprint",
	templateUrl: "./imprint.component.html",
	styleUrls: ["./imprint.component.scss"]
})
export class ImprintComponent implements OnInit {
	result;

	constructor(private userService: UserService,
				private eventService: EventService) {
	}

	ngOnInit() {
	}

	postUser() {
		this.result = this.userService.getById(0)
			.flatMap(user => this.userService.addOrModify(user));
	}

	postMerch() {
		this.result = this.eventService.getById(0, {eventType: EventType.merch})
			.flatMap(merch => this.eventService.addOrModify(merch));
	}

	postTour() {
		this.result = this.eventService.getById(0, {eventType: EventType.tours})
			.flatMap(tour => this.eventService.addOrModify(tour));
	}

	postParty() {
		this.result = this.eventService.getById(0, {eventType: EventType.tours})
			.flatMap(party => this.eventService.addOrModify(party));
	}

}
