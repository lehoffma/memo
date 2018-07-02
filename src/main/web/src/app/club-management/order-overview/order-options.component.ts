import {Component, Input, OnInit} from "@angular/core";
import {OrderOptionsService} from "./order-options.service";
import {OrderStatusList, orderStatusToString} from "../../shared/model/order-status";
import {paymentMethodList} from "../../shop/checkout/payment/payment-method";

@Component({
	selector: "memo-order-options",
	templateUrl: "./order-options.component.html",
	styleUrls: ["./order-options.component.scss"],
	providers: [OrderOptionsService]
})
export class OrderOptionsComponent implements OnInit {
	@Input() hidden: boolean = false;

	isLoading = false;
	statusCategories = OrderStatusList;
	paymentMethods = paymentMethodList();
	statusToString = orderStatusToString;

	constructor(public orderOptionsService: OrderOptionsService) {
	}

	ngOnInit() {
	}
}
