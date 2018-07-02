import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {EventUtilityService} from "../../services/event-utility.service";
import {OrderedItem} from "../../model/ordered-item";
import {Event} from "../../../shop/shared/model/event";
import {EventType} from "../../../shop/shared/model/event-type";
import {orderStatusToString} from "../../model/order-status";
import {ConfirmationDialogService} from "../../services/confirmation-dialog.service";

@Component({
	selector: "memo-ordered-item-entry",
	templateUrl: "./ordered-item-entry.component.html",
	styleUrls: ["./ordered-item-entry.component.scss"]
})
export class OrderedItemEntryComponent implements OnInit {
	@Input() orderedItem: OrderedItem;
	@Output() onEdit: EventEmitter<any> = new EventEmitter<any>();
	@Output() onRemove: EventEmitter<any> = new EventEmitter<any>();

	_cache: {
		[id: number]: {
			link: string;
			type: EventType
		}
	} = {};
	eventType = EventType;
	orderToString = orderStatusToString;

	constructor(private confirmationDialogService: ConfirmationDialogService) {
	}

	ngOnInit() {
	}

	getEventData(item: Event): { link: string; type: EventType } {
		if (!item) {
			return {link: "", type: EventType.tours};
		}
		if (!this._cache[item.id]) {
			const type = EventUtilityService.getEventType(item);
			this._cache[item.id] = {
				link: `/${type}/${item.id}`,
				type
			};

		}

		return this._cache[item.id];
	}

	remove() {
		this.confirmationDialogService.openDialog("Möchtest du dieses Item wirklich löschen?")
			.subscribe(yes => {
				if (yes) {
					this.onRemove.emit(true)
				}
			})
	}
}
