import {Component, OnInit} from "@angular/core";
import {LogInService} from "../../shared/services/api/login.service";
import {OrderService} from "../../shared/services/api/order.service";
import {Observable} from "rxjs/Observable";
import {Order} from "../../shared/model/order";

@Component({
	selector: "memo-order-history",
	templateUrl: "./order-history.component.html",
	styleUrls: ["./order-history.component.scss"]
})
export class OrderHistoryComponent implements OnInit {
	orders$: Observable<Order[]> = this.loginService
		.accountObservable
		.flatMap(userId => userId === null
			? Observable.throw(new Error("User is not logged in"))
			: this.orderService.getByUserId(userId))
		.catch(error => {
			console.error(error);
			return Observable.empty();
		});

	//todo schönere "keine bestellungen" message
	//todo timeline slider

	constructor(private loginService: LogInService,
				private orderService: OrderService) {
	}

	ngOnInit() {
	}

}
