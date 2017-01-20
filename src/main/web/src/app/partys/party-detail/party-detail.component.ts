import {Component, OnDestroy, OnInit} from "@angular/core";
import {User} from "../../shared/model/user";
import {Party} from "../../shared/model/party";
import {ActivatedRoute} from "@angular/router";
import {Subscription, Observable} from "rxjs";
import {NavigationService} from "../../shared/services/navigation.service";
import {UserStore} from "../../shared/stores/user.store";
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
                private partyStore: PartyStore,
                private userStore: UserStore,
                private navigationService: NavigationService) {

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

    getParticipants(ids: number[]): Observable<User[]> {
        return this.userStore.data.map(users => users.filter(user => ids.indexOf(user.id) !== -1));
    }


    showDetailsOfUser(user: User) {
        let url: string = `members/${user.id}`;
        this.navigationService.navigateByUrl(url);
    }
}

