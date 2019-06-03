import {Component, OnInit} from "@angular/core";
import {combineLatest, Observable, of} from "rxjs";
import {OrderService} from "../../../shared/services/api/order.service";
import {Order} from "../../../shared/model/order";
import {Filter} from "../../../shared/model/api/filter";
import {PageRequest} from "../../../shared/model/api/page-request";
import {Sort} from "../../../shared/model/api/sort";
import {filter, map, switchMap} from "rxjs/operators";
import {UserService} from "../../../shared/services/api/user.service";
import {User} from "../../../shared/model/user";
import {Omit} from "../../../util/util";

export interface UserOrder extends Omit<Order, "user"> {
	user: User;
}

@Component({
	selector: "memo-latest-orders",
	templateUrl: "./latest-orders.component.html",
	styleUrls: ["./latest-orders.component.scss"]
})
export class LatestOrdersComponent implements OnInit {

	public latestOrders$: Observable<UserOrder[]> = this.orderService.get(
		Filter.none(),
		PageRequest.first(),
		Sort.by("desc", "timeStamp")
	).pipe(
		map(it => it.content),
		// replace user ids with actual user objects
		switchMap(content => {
			if(!content || content.length === 0){
				return of([]);
			}
			return combineLatest(
				...content.map(entry => this.userService.getById(entry.user)
					.pipe(
						map(user => ({
							...entry,
							user
						}))
					)
				)
			)
		}),
	);

	constructor(public orderService: OrderService,
				private userService: UserService,) {

	}

	ngOnInit() {
	}

}
