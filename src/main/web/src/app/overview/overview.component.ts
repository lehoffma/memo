import {Component, OnInit} from "@angular/core";
import {Tour} from "../shared/model/tour";
import {Merchandise} from "../shared/model/merchandise";
import {Party} from "../shared/model/party";
import {TourStore} from "../shared/stores/tour.store";
import {MerchStore} from "../shared/stores/merch.store";
import {PartyStore} from "../shared/stores/party.store";
import {Observable} from "rxjs";
@Component({
    selector: "overview",
    templateUrl: "./overview.component.html",
    styleUrls: ["./overview.component.css"]
})
export class OverViewComponent implements OnInit {
    tours: Observable<Tour[]>;
    merch: Observable<Merchandise[]>;
    partys: Observable<Party[]>;

    constructor(public tourStore: TourStore,
                public merchStore: MerchStore,
                public partyStore: PartyStore) {
    }

    ngOnInit(): void {
        //get up to 7 preview items per category
        this.tours = this.tourStore.data.map(data => data.slice(0,7));
        this.merch = this.merchStore.data.map(data => data.slice(0,7));
        this.partys = this.partyStore.data.map(data => data.slice(0,7));
    }

}