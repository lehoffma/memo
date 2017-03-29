import {Component, OnInit} from "@angular/core";
import {Merchandise} from "../../shared/model/merchandise";
import {ActivatedRoute} from "@angular/router";
import {Observable} from "rxjs";
import {MerchStore} from "../../shared/stores/merch.store";
import {AddressStore} from "../../shared/stores/adress.store";
import {isNullOrUndefined} from "util";
import {MerchandiseOptions} from "./merchandise-options";
import {SelectionModel} from "../../object-details/selection/object-details-selection.component";
import {EventOverviewKey} from "../../object-details/container/object-details-overview/object-details-overview.component";
import {EventService} from "../../shared/services/event.service";


@Component({
    selector: "merchandise-details",
    templateUrl: "./merchandise-detail.component.html",
    styleUrls: ["./merchandise-detail.component.css"]
})
export class MerchDetailComponent implements OnInit {
    merchObservable: Observable<Merchandise> = Observable.of(new Merchandise());
	clothesSizes: Observable<string[]> = this.merchObservable.map(merch => merch.clothesSizes);
	sizeTableCategories: Observable<string[]> = this.merchObservable.map(merch => merch.sizeTableCategories);
	overViewKeys: Observable<EventOverviewKey[]> = this.merchObservable.map(merch => this.eventService.getOverviewKeys(merch));
	colorSelections: Observable<SelectionModel[]> = this.merchObservable.map(merch => merch.colorSelections);
	clothesSizeSelections: Observable<SelectionModel[]> = this.merchObservable.map(merch => merch.clothesSizeSelections);

    options: MerchandiseOptions = {size: "", color: ""};

    constructor(private route: ActivatedRoute,
				private merchStore: MerchStore,
				private addressStore: AddressStore,
				private eventService: EventService) {

    }

    ngOnInit() {
		this.merchObservable = this.route.params
			.flatMap(params => this.merchStore.getDataByID(+params["id"]));
		this.initialize();
    }

    initialize() {
		this.clothesSizes.filter(sizes => !this.options.size && sizes && sizes.length > 0)
			.subscribe(sizes => this.options.size = sizes[0]);

        this.merchObservable
            .filter(merch => !isNullOrUndefined(merch))
            .map(merch => merch.colors)
			.filter(colors => !this.options.color && colors && colors.length > 0)
			.subscribe(colors => this.options.color = colors[0]);
    }

}
