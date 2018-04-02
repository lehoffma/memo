import {Component, OnInit} from "@angular/core";
import {ModifyOrderService} from "./modify-order.service";
import {ActivatedRoute} from "@angular/router";
import {PaymentMethod, paymentMethodList} from "../../../checkout/payment/payment-method";
import {UserService} from "../../../../shared/services/api/user.service";

@Component({
	selector: "memo-modify-order",
	templateUrl: "./modify-order.component.html",
	styleUrls: ["./modify-order.component.scss"],
	providers: [ModifyOrderService]
})
export class ModifyOrderComponent implements OnInit {
	paymentMethods = paymentMethodList();
	paymentMethod = PaymentMethod;

	constructor(public modifyOrderService: ModifyOrderService,
				public userService: UserService,
				private activatedRoute: ActivatedRoute) {
		this.modifyOrderService.initFromParams(this.activatedRoute.snapshot.params);
	}

	ngOnInit() {
	}
}
