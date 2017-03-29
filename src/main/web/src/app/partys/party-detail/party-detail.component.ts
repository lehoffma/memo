import {Component, OnInit} from "@angular/core";
import {Party} from "../../shared/model/party";
import {ActivatedRoute} from "@angular/router";
import {Observable} from "rxjs";
import {PartyStore} from "../../shared/stores/party.store";
import {Participant} from "../../shared/model/participant";
import {EventOverviewKey} from "../../object-details/container/object-details-overview/object-details-overview.component";
import {EventService} from "../../shared/services/event.service";


@Component({
    selector: "partys-details",
    templateUrl: "./party-detail.component.html",
    styleUrls: ["./party-detail.component.css"]
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

    private getIds(participants: Participant[]){
        if(participants){
            return participants.map(participant => participant.id);
        }
        return [];

    }
}

