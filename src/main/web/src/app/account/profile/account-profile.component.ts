import {Component, OnDestroy, OnInit} from "@angular/core";
import {User} from "../../shared/model/user";
import {ActivatedRoute} from "@angular/router";
import {Subscription, Observable} from "rxjs";
import {UserStore} from "../../shared/stores/user.store";
import {TourStore} from "../../shared/stores/tour.store";

@Component({
    selector: "account-profiles",
    templateUrl: "./account-profile.component.html",
    styleUrls: ["./account-profile.component.css"]
})

export class AccountProfileComponent implements OnInit, OnDestroy{
    subscription:Subscription;
    user: Observable<User>;

    constructor(private route: ActivatedRoute,
                private tourStore: TourStore,
                private userStore: UserStore){

    }

    ngOnInit() {
        this.subscription = this.route.params.subscribe(params => {
            let id = +params['id']; // (+) converts string 'id' to a number

            this.user = this.userStore.getDataByID(id);
        });
    }
    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}