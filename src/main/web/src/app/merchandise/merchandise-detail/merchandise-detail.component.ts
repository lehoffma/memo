import {Component, OnDestroy, OnInit} from "@angular/core";
import {Merchandise} from "../../shared/model/merchandise";
import {ActivatedRoute} from "@angular/router";
import {Subscription, Observable} from "rxjs";
import {MerchStore} from "../../shared/stores/merch.store";
import {NavigationService} from "../../shared/services/navigation.service";
import {ClothesSize} from "../../shared/model/clothes-size";
import {AddressStore} from "../../shared/stores/adress.store";
import {Address} from "../../shared/model/address";


@Component({
    selector: "merchandise-details",
    templateUrl: "./merchandise-detail.component.html",
    styleUrls: ["./merchandise-detail.component.css"]
})

export class MerchDetailComponent implements OnInit, OnDestroy{
    merchObservable: Observable<Merchandise> = Observable.of(new Merchandise());
    subscription:Subscription;
    clothesSize = ClothesSize;
    clothesSizeKeys = Object.keys(this.clothesSize).filter(key => isNaN(+key));
    attributes = ['Brustumfang', 'Tailenumfang', 'Hüftumfang', 'Modelllänge', 'Schulterbreite'];
    attributeIndices = this.attributes.map((attr, index) => index);

    constructor(private route: ActivatedRoute,
                private merchStore: MerchStore,
                private navigationService: NavigationService,
                private addressStore: AddressStore) {

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

    getAddress(id: number): Observable<Address> {
        return this.addressStore.getDataByID(id);
    }

}