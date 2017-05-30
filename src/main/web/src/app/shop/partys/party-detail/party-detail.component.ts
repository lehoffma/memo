import {Component, OnInit} from "@angular/core";
import {Party} from "../../shared/model/party";
import {ActivatedRoute} from "@angular/router";
import {Observable} from "rxjs";
import {Participant} from "../../shared/model/participant";
import {EventOverviewKey} from "../../item-details/container/overview/event-overview-key";
import {EventService} from "../../../shared/services/event.service";
import {EventType} from "../../shared/model/event-type";
import {ParticipantsService} from "../../../shared/services/participants.service";


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
		.flatMap((party:Party) => this.participantService.getParticipantIdsByEvent(party.id, EventType.partys));

	constructor(private route: ActivatedRoute,
				private participantService: ParticipantsService,
				private eventService: EventService) {

	}

	ngOnInit() {
	}
}

