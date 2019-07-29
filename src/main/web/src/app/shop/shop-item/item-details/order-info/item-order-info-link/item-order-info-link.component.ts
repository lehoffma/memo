import {ChangeDetectionStrategy, Component, Input, OnInit} from "@angular/core";
import {Order} from "../../../../../shared/model/order";
import {OrderedItem} from "../../../../../shared/model/ordered-item";
import {ShopEvent} from "../../../../shared/model/event";
import {EventType} from "../../../../shared/model/event-type";
import {OrderStatus, orderStatusMap} from "../../../../../shared/model/order-status";

@Component({
	selector: "memo-item-order-info-link",
	templateUrl: "./item-order-info-link.component.html",
	styleUrls: ["./item-order-info-link.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemOrderInfoLinkComponent implements OnInit {
	@Input() order: Order;
	@Input() item: ShopEvent;
	@Input() isNewest: boolean = false;

	eventType = EventType;

	constructor() {
	}

	ngOnInit() {
	}

	statusToString(status: OrderStatus): string {
		return orderStatusMap[status].label;
	}

	getAmountOfOtherOrderedItems(orderedItems: OrderedItem[], item: ShopEvent): number{
		if(!item){
			return 0;
		}

		return orderedItems.filter(it => it.item.id !== item.id).length;
	}

	//only show ordered items for the currently viewed shopitem
	filterItem(orderedItems: OrderedItem[], item: ShopEvent): OrderedItem[] {
		if (!item) {
			return orderedItems;
		}

		return orderedItems.filter(it => it.item.id === item.id);
	}
}
