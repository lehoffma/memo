import {Component, OnDestroy, OnInit} from "@angular/core";
import {Tour} from "../../shared/model/tour";
import {User} from "../../shared/model/user";
import {Party} from "../../shared/model/party";
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription, Observable} from "rxjs";
import {TourStore} from "../../shared/stores/tour.store";
import {NavigationService} from "../../shared/services/navigation.service";
import {UserStore} from "../../shared/stores/user.store";
import {PartyStore} from "../../shared/stores/party.store";


@Component({
    selector: "partys-details",
    templateUrl: "./party-detail.component.html",
    styleUrls: ["./party-detail.component.css"]
})

export class PartyDetailComponent implements OnInit, OnDestroy {
    partyObservable:Observable<Party>;
    subscription:Subscription;

constructor(private route: ActivatedRoute,
    private partyStore: PartyStore,
    private userStore: UserStore,
    private navigationService:NavigationService){

}
ngOnInit(){
    this.subscription = this.route.params.subscribe(params => {
        let id = +params['id']; // (+) converts string 'id' to a number

        this.partyObservable = this.partyStore.getDataByID(id);
    });
}

ngOnDestroy(){
    this.subscription.unsubscribe();
}
getParticipants(ids: number[]): Observable<User[]>{
    return this.userStore.data.map(users => users.filter(user => ids.indexOf(user.id) !== -1));
}


    showDetailsOfUser(user: User){
        let url: string = `members/${user.id}`;
        this.navigationService.navigateByUrl(url);
    }
}

