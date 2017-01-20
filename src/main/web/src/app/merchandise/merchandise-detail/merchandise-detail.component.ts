import {Component, OnDestroy, OnInit} from "@angular/core";
import {Merchandise} from "../../shared/model/merchandise";
import {ActivatedRoute} from "@angular/router";
import {Subscription, Observable} from "rxjs";
import {MerchStore} from "../../shared/stores/merch.store";
import {NavigationService} from "../../shared/services/navigation.service";


@Component({
    selector: "merchandise-details",
    templateUrl: "./merchandise-detail.component.html",
    styleUrls: ["./merchandise-detail.component.css"]
})

export class MerchDetailComponent implements OnInit, OnDestroy{
    merchObservable: Observable<Merchandise> = Observable.of(new Merchandise());
    subscription:Subscription;

    constructor(private route: ActivatedRoute,
                private merchStore: MerchStore,
                private navigationService:NavigationService){

    }

    ngOnInit() {
        this.subscription = this.route.params.subscribe(params => {
            let id = +params['id']; // (+) converts string 'id' to a number

            this.merchObservable = this.merchStore.getDataByID(id);
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }



}