import {Component, Input, OnInit} from "@angular/core";
import {Observable} from "rxjs";
import {MdDialog} from "@angular/material";
import {ItemImagePopupComponent} from "./image-popup/item-image-popup.component";
import {Event} from "../../../shared/model/event";
import {EventOverviewKey} from "./overview/event-overview-key";
import {LogInService} from "../../../../shared/services/login.service";
import {EventUtilityService} from "../../../../shared/services/event-utility.service";
import {Permission} from "../../../../shared/model/permission";
import {EventType} from "../../../shared/model/event-type";


@Component({
	selector: "memo-item-details-container",
	templateUrl: "./item-details-container.component.html",
	styleUrls: ["./item-details-container.component.scss"]
})
export class ItemDetailsContainerComponent implements OnInit {
	@Input() event: Event;
	@Input() overviewKeys: Observable<EventOverviewKey[]> = Observable.of([]);

	userCanEditEvent: Observable<boolean> = this.loginService.currentUser()
		.map((user) => {
			if (user !== null && this.event !== null) {
				let permissions = user.userPermissions;
				let permissionKey = EventUtilityService.handleShopItem(this.event,
					merch => "merch",
					tour => "tour",
					party => "party"
				);
				if (permissionKey) {
					return permissions[permissionKey] >= Permission.write;
				}
			}

			return false;
		});

	userCanAccessEntries$: Observable<boolean> = this.loginService.currentUser()
		.map((user) => {
			if(user !== null && this.event !== null){
				let eventType = EventUtilityService.getEventType(this.event);
				if(eventType === EventType.partys || eventType === EventType.tours){
					let permissions = user.userPermissions;
					return permissions.funds >= Permission.read;
				}
			}
			return false;
		});

	constructor(private mdDialog: MdDialog,
				private loginService: LogInService) {
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
