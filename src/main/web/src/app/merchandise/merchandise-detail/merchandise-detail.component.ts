import {Component, OnDestroy, OnInit} from "@angular/core";
import {Merchandise} from "../../shared/model/merchandise";
import {ActivatedRoute} from "@angular/router";
import {Subscription, Observable} from "rxjs";
import {MerchStore} from "../../shared/stores/merch.store";
import {NavigationService} from "../../shared/services/navigation.service";
import {AddressStore} from "../../shared/stores/adress.store";
import {Address} from "../../shared/model/address";
import {isNullOrUndefined} from "util";
import {MerchandiseOptions} from "./merchandise-options";
import {SelectionModel} from "../../object-details/selection/object-details-selection.component";


@Component({
    selector: "merchandise-details",
    templateUrl: "./merchandise-detail.component.html",
    styleUrls: ["./merchandise-detail.component.css"]
})
export class MerchDetailComponent implements OnInit, OnDestroy {
    merchObservable: Observable<Merchandise> = Observable.of(new Merchandise());
    subscription: Subscription;
    clothesSizes: Observable<string[]> = Observable.of([]);
    sizeTableCategories: Observable<string[]> = Observable.of([]);

    options: MerchandiseOptions = {size: "", color: ""};
    colorSelections: Observable<SelectionModel[]> = Observable.of([]);

    //todo: hier dran liegt das wohl? aber kp warum
    clothesSizeSelections: Observable<SelectionModel[]> = Observable.of([]);


    constructor(private route: ActivatedRoute,
                private merchStore: MerchStore,
                private navigationService: NavigationService,
                private addressStore: AddressStore) {

    }

    ngOnInit() {
        this.subscription = this.route.params.subscribe(params => {
            let id = +params['id']; // (+) converts string 'id' to a number

            this.merchObservable = this.merchStore.getDataByID(id);

            if (this.merchObservable) {
                this.initialize();
            }
        });
    }

    initialize() {
        this.clothesSizes = this.merchObservable
            .filter(merch => !isNullOrUndefined(merch))
            .map(merch => {
                return Object.keys(merch.sizeTable)
            });

        this.colorSelections = this.merchObservable
            .filter(merch => !isNullOrUndefined(merch))
            .map(merch => merch.colors)
            .map(colors =>
                colors.map(color => {
                    return {
                        value: color,
                        color: color
                    };
                })
            );

        this.clothesSizeSelections = this.clothesSizes
            .map(sizes => sizes.map(size => {
                return {
                    value: size,
                    color: "white",
                    text: size
                };
            }));

        this.sizeTableCategories = this.merchObservable
            .filter(merch => !isNullOrUndefined(merch))
            .map(merch => merch.sizeTable)
            .map(sizeTable => {
                return Object.keys(sizeTable).reduce((prev: string[], size: string) => {
                    Object.keys(sizeTable[size]).forEach(category => {
                        if (prev.indexOf(category) === -1) {
                            prev.push(category);
                        }
                    });

                    return prev;
                }, []);
            });

        this.clothesSizes.subscribe(sizes => {
            if (!this.options.size && sizes && sizes.length > 0) {
                this.options.size = sizes[0];
            }
        });
        this.merchObservable
            .filter(merch => !isNullOrUndefined(merch))
            .map(merch => merch.colors)
            .subscribe(colors => {
                if (!this.options.color && colors && colors.length > 0) {
                    this.options.color = colors[0];
                }
            })
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    getAddress(id: number): Observable<Address> {
        return this.addressStore.getDataByID(id);
    }

}