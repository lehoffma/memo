import {Component, OnInit} from "@angular/core";
import {UserService} from "../../shared/services/api/user.service";
import {EventService} from "../../shared/services/api/event.service";
import {mergeMap} from "rxjs/operators";

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
			.pipe(
				mergeMap(user => this.userService.add(user))
			)
	}

	postMerch() {
		this.result = this.eventService.getById(0)
			.pipe(
				mergeMap(merch => this.eventService.add(merch))
			);
	}

	postTour() {
		this.result = this.eventService.getById(0)
			.pipe(
				mergeMap(tour => this.eventService.add(tour))
			);
	}

	postParty() {
		this.result = this.eventService.getById(0)
			.pipe(
				mergeMap(party => this.eventService.add(party))
			);
	}

}
