import {Component, Input, OnInit} from "@angular/core";
import {Observable} from "rxjs";
import {Event} from "../../shared/model/event";
import {EventOverviewKey} from "./object-details-overview/object-details-overview.component";


@Component({
    selector: 'object-details-container',
    templateUrl: 'object-details-container.component.html',
    styleUrls: ["object-details-container.component.scss"]
})
export class ObjectDetailsContainerComponent implements OnInit {
    @Input() eventObservable: Observable<Event> = Observable.of();
	@Input() overviewKeys: Observable<EventOverviewKey[]> = Observable.of([]);


	constructor() {
    }

    ngOnInit() {
    }

}
