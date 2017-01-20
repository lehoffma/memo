import {Component, OnDestroy, OnInit} from "@angular/core";
import {User} from "../../shared/model/user";
import {ActivatedRoute} from "@angular/router";
import {Subscription, Observable} from "rxjs";
import {UserStore} from "../../shared/stores/user.store";
import {TourStore} from "../../shared/stores/tour.store";
import {Tour} from "../../shared/model/tour";
import {Party} from "../../shared/model/party";
import {PartyStore} from "../../shared/stores/party.store";

@Component({
    selector: "account-profiles",
    templateUrl: "./account-profile.component.html",
    styleUrls: ["./account-profile.component.css"]
})

export class AccountProfileComponent implements OnInit, OnDestroy {
    subscription: Subscription;
    observableUser: Observable<User>;
    user: User;

    constructor(private route: ActivatedRoute,
                private tourStore: TourStore,
                private userStore: UserStore,
                private partyStore: PartyStore) {

    }

    ngOnInit() {
        this.subscription = this.route.params.subscribe(params => {
            let id = +params['id']; // (+) converts string 'id' to a number

            this.observableUser = this.userStore.getDataByID(id);
            this.observableUser.subscribe(user => {
                this.user = user;

            })
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    getEventsOfUser(id: number) {
        return Observable.zip(this.tourStore.data, this.partyStore.data, (tours, partys) => {
            //combine the two arrays into one
            return [...tours, ...partys];
        })
            .map((events: (Tour|Party)[]) =>
                events.filter(event =>
                    event.participants.find(participantID => participantID === id) !== undefined
                )
            );
    }

    showEvent() {
        //todo
    }
}