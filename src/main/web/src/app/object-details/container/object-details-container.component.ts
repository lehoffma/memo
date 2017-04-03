import {Component, Input, OnInit} from "@angular/core";
import {Observable} from "rxjs";
import {Event} from "../../shared/model/event";
import {EventOverviewKey} from "./object-details-overview/object-details-overview.component";
import {MdDialog} from "@angular/material";
import {ObjectImagePopupComponent} from "./object-image-popup/object-image-popup.component";


@Component({
	selector: 'object-details-container',
	templateUrl: 'object-details-container.component.html',
	styleUrls: ["object-details-container.component.scss"]
})
export class ObjectDetailsContainerComponent implements OnInit {
	@Input() eventObservable: Observable<Event> = Observable.of();
	@Input() overviewKeys: Observable<EventOverviewKey[]> = Observable.of([]);


	constructor(private mdDialog: MdDialog) {
	}

	ngOnInit() {
	}

	showDetailedImage(imagePath: string) {
		this.mdDialog.open(ObjectImagePopupComponent, {
			data: {
				imagePath: imagePath
			}
		})
	}
}
