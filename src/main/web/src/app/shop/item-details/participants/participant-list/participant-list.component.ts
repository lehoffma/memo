import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, UrlSegment} from "@angular/router";
import {Participant, ParticipantUser} from "../../../shared/model/participant";
import {Observable} from "rxjs/Observable";
import {EventType} from "../../../shared/model/event-type";
import {ParticipantsService} from "../../../../shared/services/participants.service";
import {UserService} from "../../../../shared/services/user.service";
import {User} from "../../../../shared/model/user";

@Component({
	selector: "memo-participant-list",
	templateUrl: "./participant-list.component.html",
	styleUrls: ["./participant-list.component.scss"]
})
export class ParticipantListComponent implements OnInit {
	participants: Observable<ParticipantUser[]> = this.activatedRoute.url
		.flatMap((urls:UrlSegment[]) => {
			// "tours/:id/participants"
			// "partys/:id/participants"
			let eventType = EventType[urls[0].path];
			let eventId = +urls[1].path;

			return this.participantService.getParticipantUsersByEvent(eventId, eventType);
		});

	constructor(private activatedRoute: ActivatedRoute,
				private userService: UserService,
				private participantService: ParticipantsService) {
	}

	ngOnInit() {
	}

}
