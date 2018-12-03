import {Component, Input, OnInit} from "@angular/core";
import {OrderOptionsService} from "./order-options.service";
import {OrderStatusList, orderStatusToString} from "../../shared/model/order-status";
import {paymentMethodList} from "../../shop/checkout/payment/payment-method";
import {AbstractControl} from "@angular/forms";
import {Subject} from "rxjs";
import {Event} from "../../shop/shared/model/event";
import {EventType} from "../../shop/shared/model/event-type";
import {EventUtilityService} from "../../shared/services/event-utility.service";

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

	onDestroy$ = new Subject();

	constructor(public orderOptionsService: OrderOptionsService) {
	}

	atLeastOneFalse(value): boolean {
		return Object.keys(value).some(key => !value[key]);
	}

	setToTrue(form: AbstractControl) {
		const value = form.value;
		form.setValue(Object.keys(value).reduce((acc, key) => {
			acc[key] = true;
			return acc
		}, {}));
	}


	/**
	 *
	 * @param {Event} event
	 * @returns {EventType}
	 */
	getEventType(event: Event): EventType {
		return EventUtilityService.getEventType(event);
	}


	ngOnInit() {
	}

	selectOption(control: AbstractControl, method: any) {
		const value = control.value;
		control.setValue(Object.keys(value).reduce((acc, key) => {
			acc[key] = key === method;
			return acc
		}, {}));
	}
}
