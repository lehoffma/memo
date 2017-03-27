import {Component, Input, OnInit} from "@angular/core";
import {Observable} from "rxjs";
import {Event} from "../../shared/model/event";
import {EventType} from "../../shared/model/event-type";
import {EventService} from "../../shared/services/event.service";
import {isNullOrUndefined} from "util";
import {ShoppingCartService} from "../../shared/services/shopping-cart.service";


export interface EventOverviewKey {
    key: string,
    label: string,
    pipe?: "date" | "price" | "miles"
}

export const overViewKeys = {
    "merch": [
        {
            key: "price",
            label: "Preis",
            pipe: "price"
        },
        {
            key: "material",
            label: "Material",
        },
        {
            key: "capacity",
            label: "Auf Lager",
        },
        {
            key: "expectedRole",
            label: "Für"
        },
    ],
    "tours": [
        {
            key: "price",
            label: "Preis",
            pipe: "price"
        },
        {
            key: "date",
            label: "Datum",
            pipe: "date"
        },
        {
            key: "emptySeats",
            label: "Freie Plätze"
        },
        {
            key: "miles",
            label: "Meilen"
        }
    ],
    "partys": [
        {
            key: "price",
            label: "Preis",
            pipe: "price"
        },
        {
            key: "date",
            label: "Datum",
            pipe: "date"
        },
        {
            key: "emptySeats",
            label: "Freie Plätze"
        },
        {
            key: "expectedRole",
            label: "Für"
        },
    ]
};

@Component({
    selector: 'object-details-container',
    templateUrl: 'object-details-container.component.html',
    styleUrls: ["object-details-container.component.scss"]
})
export class ObjectDetailsContainerComponent implements OnInit {
    @Input() eventObservable: Observable<Event> = Observable.of();
    overviewKeys: Observable<EventOverviewKey[]> = Observable.of([]);

    selected: boolean = false;
    model = {
        options: {},
        amount: undefined
    };

    constructor(private eventService: EventService,
                private shoppingCartService: ShoppingCartService) {
    }

    ngOnInit() {
        this.overviewKeys = this.getOverviewKeysFromObject(this.eventObservable);
    }

    getOverviewKeysFromObject(eventObservable: Observable<Event>): Observable<EventOverviewKey[]> {
        return eventObservable.map(event => {
            if (isNullOrUndefined(event)) {
                return [];
            }
            if (this.eventService.isMerchandise(event)) {
                return overViewKeys.merch;
            }
            if (this.eventService.isTour(event)) {
                return overViewKeys.tours;
            }
            if (this.eventService.isParty(event)) {
                return overViewKeys.partys;
            }
        })
    }

    /**
     * Fügt das aktuelle Item dem Warenkorb hinzu.
     */
    addToCart(item: Event) {
        this.shoppingCartService.addItem(EventType.tours, {
            id: item.id,
            options: this.model.options,
            amount: this.model.amount
        });
        this.model.amount = undefined;
    }
}