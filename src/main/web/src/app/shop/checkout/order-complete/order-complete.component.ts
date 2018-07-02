import {Component, OnDestroy, OnInit} from "@angular/core";
import {OrderService} from "../../../shared/services/api/order.service";
import {Order} from "../../../shared/model/order";
import {Observable} from "rxjs";

@Component({
	selector: "memo-order-complete",
	templateUrl: "./order-complete.component.html",
	styleUrls: ["./order-complete.component.scss"]
})
export class OrderCompleteComponent implements OnInit, OnDestroy {

	order$: Observable<Order>;

	constructor(private orderService: OrderService) {
		this.order$ = this.orderService.getById(this.orderService.completedOrder);
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
		this.orderService.completedOrder = null;
	}


}
