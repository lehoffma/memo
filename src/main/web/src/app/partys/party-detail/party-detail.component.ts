import {Component, OnDestroy, OnInit} from "@angular/core";
import {Party} from "../../shared/model/party";
import {ActivatedRoute} from "@angular/router";
import {Subscription, Observable} from "rxjs";
import {PartyStore} from "../../shared/stores/party.store";


@Component({
    selector: "partys-details",
    templateUrl: "./party-detail.component.html",
    styleUrls: ["./party-detail.component.css"]
})

export class PartyDetailComponent implements OnInit, OnDestroy {
    partyObservable: Observable<Party> = Observable.of(new Party());
    subscription: Subscription;

    constructor(private route: ActivatedRoute,
                private partyStore: PartyStore,) {

    }

    ngOnInit() {
        this.subscription = this.route.params.subscribe(params => {
            let id = +params['id']; // (+) converts string 'id' to a number

            this.partyObservable = this.partyStore.getDataByID(id);
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}

