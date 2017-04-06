import {Component, OnInit} from "@angular/core";
import {Party} from "../../shared/model/party";
import {ActivatedRoute} from "@angular/router";
import {Observable} from "rxjs";
import {Participant} from "../../shared/model/participant";
import {EventOverviewKey} from "../../item-details/container/overview/event-overview-key";
import {EventService} from "../../../shared/services/event.service";
import {PartyStore} from "../../../shared/stores/party.store";


@Component({
	selector: "memo-party-details",
	templateUrl: "./party-detail.component.html",
	styleUrls: ["./party-detail.component.scss"]
})

export class PartyDetailComponent implements OnInit {
	partyObservable: Observable<Party> = Observable.of(new Party());
	overViewKeys: Observable<EventOverviewKey[]> = this.partyObservable.map(merch => this.eventService.getOverviewKeys(merch));

	constructor(private route: ActivatedRoute,
				private partyStore: PartyStore,
				private eventService: EventService) {

	}

	ngOnInit() {
		this.partyObservable = this.route.params.flatMap(params => this.partyStore.getDataByID(+params["id"]));
	}

	private getIds(participants: Participant[]) {
		if (participants) {
			return participants.map(participant => participant.id);
		}
		return [];

	}
}

