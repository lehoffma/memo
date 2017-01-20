import {Component, OnDestroy, OnInit} from "@angular/core";
import {Tour} from "../../shared/model/tour";
import {User} from "../../shared/model/user";
import {ActivatedRoute} from "@angular/router";
import {Subscription, Observable} from "rxjs";
import {TourStore} from "../../shared/stores/tour.store";
import {NavigationService} from "../../shared/services/navigation.service";
import {UserStore} from "../../shared/stores/user.store";
import {AddressStore} from "../../shared/stores/adress.store";
import {Address} from "../../shared/model/address";


@Component({
    selector: "tour-details",
    templateUrl: "./tours-detail.component.html",
    styleUrls: ["./tours-detail.component.css"]
})

export class TourDetailComponent implements OnInit, OnDestroy {
    tourObservable: Observable<Tour> = Observable.of(new Tour());
    subscription: Subscription;

    constructor(private route: ActivatedRoute,
                private tourStore: TourStore,
                private userStore: UserStore,
                private navigationService: NavigationService,
                private addressStore: AddressStore) {

    }

    ngOnInit() {
        this.subscription = this.route.params.subscribe(params => {
            let id = +params['id']; // (+) converts string 'id' to a number

            this.tourObservable = this.tourStore.getDataByID(id);
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


    getAddress(id: number): Observable<Address> {
        return this.addressStore.getDataByID(id);
    }
}