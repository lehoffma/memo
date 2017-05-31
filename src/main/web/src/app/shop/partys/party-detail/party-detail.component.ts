import {Component, OnInit} from "@angular/core";
import {Party} from "../../shared/model/party";
import {ActivatedRoute} from "@angular/router";
import {Observable} from "rxjs";
import {EventOverviewKey} from "../../item-details/container/overview/event-overview-key";
import {EventService} from "../../../shared/services/event.service";
import {EventType} from "../../shared/model/event-type";
import {ParticipantsService} from "../../../shared/services/participants.service";
import {LogInService} from "../../../shared/services/login.service";
import {Permission} from "../../../shared/model/permission";
import {rolePermissions} from "../../../shared/model/club-role";


@Component({
	selector: "memo-party-details",
	templateUrl: "./party-detail.component.html",
	styleUrls: ["./party-detail.component.scss"]
})

export class PartyDetailComponent implements OnInit {
	partyObservable: Observable<Party> = this.route.params
		.flatMap(params => this.eventService.getById(+params["id"], {eventType: EventType.partys}));

	overViewKeys: Observable<EventOverviewKey[]> = this.partyObservable.map(party => party.overviewKeys);

	participants = this.partyObservable
		.flatMap((party: Party) => this.participantService.getParticipantUsersByEvent(party.id, EventType.partys));

	participantsLink = Observable.combineLatest(this.partyObservable, this.loginService.currentUser())
		.map(([party, user]) => {
			if (user !== null) {
				let permissions = user.permissions ? user.permissions : rolePermissions[user.clubRole];
				return permissions.party >= Permission.write
					? "/partys/" + party.id + "/participants"
					: null
			}
			return null;
		});

	constructor(private route: ActivatedRoute,
				private participantService: ParticipantsService,
				private loginService: LogInService,
				private eventService: EventService) {

	}

	ngOnInit() {
	}
}

