import {Component, Input, OnInit} from "@angular/core";
import {User} from "../../model/user";
import {OrderedItem} from "../../model/ordered-item";
import {EventUtilityService} from "../../services/event-utility.service";
import {OrderStatusData} from "../../model/order-status";

@Component({
	selector: "memo-order-preview-renderer",
	templateUrl: "./order-preview-renderer.component.html",
	styleUrls: ["./order-preview-renderer.component.scss"]
})
export class OrderPreviewRendererComponent implements OnInit {
	@Input() timestamp: Date;
	@Input() user: User;
	@Input() items: OrderedItem[];

	orderStatusData = OrderStatusData;

	constructor() {
	}

	ngOnInit() {
	}

	getItemLink(item: OrderedItem): string{
		return "/shop/" + EventUtilityService.getEventType(item.item) + "/" + item.item.id;
	}

}
