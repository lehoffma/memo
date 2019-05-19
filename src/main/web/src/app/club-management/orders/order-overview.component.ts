import {Component, OnInit} from "@angular/core";
import {OrderOverviewService} from "./order-overview.service";
import {Observable} from "rxjs";

@Component({
	selector: "memo-order-overview",
	templateUrl: "./order-overview.component.html",
	styleUrls: ["./order-overview.component.scss"]
})
export class OrderOverviewComponent implements OnInit {
	openOrders$: Observable<{ open: number; change: number }> = this.orderOverviewService.openOrders();
	totalOrders$: Observable<{ total: number; change: number }> = this.orderOverviewService.totalOrders();

	constructor(public orderOverviewService: OrderOverviewService) {
	}

	ngOnInit() {
	}

}
