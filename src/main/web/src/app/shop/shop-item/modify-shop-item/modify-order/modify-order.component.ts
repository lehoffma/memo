import {Component, OnInit} from "@angular/core";
import {ModifyOrderService} from "./modify-order.service";
import {ActivatedRoute} from "@angular/router";
import {PaymentMethod, paymentMethodList} from "../../../checkout/payment/payment-method";
import {UserService} from "../../../../shared/services/api/user.service";
import {ModifyItemService} from "../modify-item.service";
import {ModifyType} from "../modify-type";
import {WindowService} from "../../../../shared/services/window.service";

@Component({
	selector: "memo-modify-order",
	templateUrl: "./modify-order.component.html",
	styleUrls: ["./modify-order.component.scss"],
	providers: [ModifyOrderService]
})
export class ModifyOrderComponent implements OnInit {
	paymentMethods = paymentMethodList();
	paymentMethod = PaymentMethod;
	ModifyType = ModifyType;

	isDesktop$ = this.windowService.hasMinDimensions(800);
	constructor(public modifyOrderService: ModifyOrderService,
				public modifyItemService: ModifyItemService,
				private windowService: WindowService,
				public userService: UserService,
				private activatedRoute: ActivatedRoute) {
		this.modifyOrderService.initFromParams(this.activatedRoute.snapshot.params);
	}

	ngOnInit() {
	}
}
