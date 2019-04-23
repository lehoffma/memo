import {ChangeDetectorRef, Component, Input, OnInit} from "@angular/core";
import {OrderStatus, OrderStatusList} from "../../../model/order-status";
import {timer} from "rxjs";

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
	} = {
		[OrderStatus.RESERVED]: {
			position: 1,
			colorClass: "info",
			tooltip: "Reserviert"
		},
		[OrderStatus.UNDER_APPROVAL]: {
			position: 1,
			colorClass: "wait",
			icon: "search",
			tooltip: "Unter Begutachtung"
		},
		[OrderStatus.REFUSED]: {
			position: 1,
			colorClass: "error",
			icon: "clear",
			tooltip: "Abgelehnt"
		},
		[OrderStatus.ORDERED]: {
			position: 2,
			colorClass: "info",
			tooltip: "Bestellt"
		},
		[OrderStatus.PAYMENT_REQUESTED]: {
			position: 2,
			colorClass: "warn",
			icon: "access_time",
			tooltip: "Bezahlung angefordert"
		},
		[OrderStatus.PAID]: {
			position: 3,
			colorClass: "info",
			tooltip: "Bezahlt"
		},
		[OrderStatus.SENT]: {
			position: 4,
			colorClass: "info",
			tooltip: "Verschickt"
		},
		[OrderStatus.COMPLETED]: {
			position: 5,
			colorClass: "info",
			tooltip: "Abgeschlossen"
		},
		[OrderStatus.PARTICIPATED]: {
			position: 6,
			colorClass: "success",
			tooltip: "Teilgenommen"
		},
		[OrderStatus.CANCELLED]: {
			position: 10,
			colorClass: "error",
			tooltip: "Storniert"
		},
	};
	tooltips: string[] = [
		undefined,
		this.statusData.Reserved.tooltip,
		this.statusData.Ordered.tooltip,
		this.statusData.Paid.tooltip,
		this.statusData.Sent.tooltip,
		this.statusData.Completed.tooltip,
		this.statusData.Participated.tooltip
	];


	constructor() {
	}

	ngOnInit() {
	}

}
