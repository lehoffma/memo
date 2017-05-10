import {Component, OnInit} from "@angular/core";
import {Party} from "../../shared/model/party";
import {ActivatedRoute} from "@angular/router";
import {Observable} from "rxjs";
import {Participant} from "../../shared/model/participant";
import {EventOverviewKey} from "../../item-details/container/overview/event-overview-key";
import {EventService} from "../../../shared/services/event.service";
import {EventType} from "../../shared/model/event-type";


@Component({
	selector: "memo-party-details",
	templateUrl: "./party-detail.component.html",
	styleUrls: ["./party-detail.component.scss"]
})

export class PartyDetailComponent implements OnInit {
	partyObservable: Observable<Party> = Observable.of(Party.create());
	overViewKeys: Observable<EventOverviewKey[]> = this.partyObservable.map(party => party.overviewKeys);

	constructor(private route: ActivatedRoute,
				private eventService: EventService) {

	}

	ngOnInit() {
		this.partyObservable = this.route.params
			.flatMap(params => this.eventService.getById(+params["id"], {eventType: EventType.partys}));
	}

	private getIds(participants: Participant[]) {
		if (participants) {
			return participants.map(participant => participant.id);
		}
		return [];

	}
}

