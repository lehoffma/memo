import {Component, OnDestroy, OnInit} from "@angular/core";
import {Tour} from "../../shared/model/tour";
import {ActivatedRoute} from "@angular/router";
import {Subscription, Observable} from "rxjs";
import {TourStore} from "../../shared/stores/tour.store";


@Component({
    selector: "tour-details",
    templateUrl: "./tours-detail.component.html",
    styleUrls: ["./tours-detail.component.scss"]
})
export class TourDetailComponent implements OnInit, OnDestroy {
    tourObservable: Observable<Tour> = Observable.of(new Tour());
    subscription: Subscription;


    tourRoute = {
        from: {
            latitude: 52.422650,
            longitude: 10.786546
        },
        to: {
            latitude: 53.0664330,
            longitude: 8.837605
        },
        center: function () {
            return {
                latitude: (this.from.latitude + this.to.latitude) / 2,
                longitude: (this.from.longitude + this.to.longitude) / 2
            }
        }
    };

    constructor(private activatedRoute: ActivatedRoute,
                private tourStore: TourStore) {

    }

    ngOnInit() {
        this.subscription = this.activatedRoute.params.subscribe(params => {
            let id = +params['id']; // (+) converts string 'id' to a number

            this.tourObservable = this.tourStore.getDataByID(id);
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}