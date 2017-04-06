import {Component, Input, OnInit} from "@angular/core";
import {Observable} from "rxjs";
import {MdDialog} from "@angular/material";
import {ItemImagePopupComponent} from "./image-popup/item-image-popup.component";
import {Event} from "../../shared/model/event";
import {EventOverviewKey} from "./overview/event-overview-key";


@Component({
	selector: "memo-item-details-container",
	templateUrl: "item-details-container.component.html",
	styleUrls: ["item-details-container.component.scss"]
})
export class ItemDetailsContainerComponent implements OnInit {
	@Input() eventObservable: Observable<Event> = Observable.of();
	@Input() overviewKeys: Observable<EventOverviewKey[]> = Observable.of([]);


	constructor(private mdDialog: MdDialog) {
	}

	ngOnInit() {
	}

	showDetailedImage(imagePath: string) {
		this.mdDialog.open(ItemImagePopupComponent, {
			data: {
				imagePath: imagePath
			}
		})
	}
}
