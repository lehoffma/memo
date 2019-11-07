import {Component, Input, OnInit} from "@angular/core";
import {OrderStatus, OrderStatusData} from "../../../model/order-status";

@Component({
	selector: "memo-order-item-status",
	templateUrl: "./order-item-status.component.html",
	styleUrls: ["./order-item-status.component.scss"]
})
export class OrderItemStatusComponent implements OnInit {
	@Input() status: {
		label: string;
		css: string;
		value: OrderStatus;
		tooltip?: string;
	};
	statusData: {
		[key in OrderStatus]: {
			position: number;
			icon?: string;
			colorClass: string;
			tooltip: string;
		}
	} = OrderStatusData;
	tooltips: string[] = [
		undefined,
		this.statusData.Reserved.tooltip,
		this.statusData.Ordered.tooltip,
		this.statusData.Paid.tooltip,
		this.statusData.Sent.tooltip,
		this.statusData.Completed.tooltip,
		this.statusData.Participated.tooltip
	];
	OrderStatus = OrderStatus;
	@Input() cancelTimestamp: Date;


	constructor() {
	}

	ngOnInit() {
	}

}
