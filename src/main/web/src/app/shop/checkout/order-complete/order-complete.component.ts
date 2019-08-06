import {Component, OnDestroy, OnInit} from "@angular/core";
import {OrderService} from "../../../shared/services/api/order.service";
import {Order} from "../../../shared/model/order";
import {BehaviorSubject, Subject} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import {filter, map, takeUntil} from "rxjs/operators";
import {isNullOrUndefined} from "util";
import {userPermissions} from "../../../shared/model/user";
import {Permission} from "../../../shared/model/permission";
import {LogInService} from "../../../shared/services/api/login.service";

@Component({
	selector: "memo-order-complete",
	templateUrl: "./order-complete.component.html",
	styleUrls: ["./order-complete.component.scss"]
})
export class OrderCompleteComponent implements OnInit, OnDestroy {
	canEdit$ = this.loginService.currentUser$.pipe(
		filter(user => user !== null),
		map(user => userPermissions(user).funds >= Permission.write),
	);
	canSeeDescription$ = this.loginService.currentUser$.pipe(
		filter(user => user !== null),
		map(user => userPermissions(user).funds >= Permission.read),
	);


	loading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
	order$: BehaviorSubject<Order> = new BehaviorSubject<Order>(null);
	error$: BehaviorSubject<any> = new BehaviorSubject<any>(undefined);

	onDestroy$ = new Subject();

	constructor(private orderService: OrderService,
				private loginService: LogInService,
				private activatedRoute: ActivatedRoute) {
		if (!isNullOrUndefined(this.orderService.completedOrder)) {
			this.update(this.orderService.completedOrder);
		}
		this.activatedRoute.queryParamMap.pipe(
			filter(map => map.has("id")),
			map(map => map.get("id")),
			takeUntil(this.onDestroy$)
		).subscribe(id => this.update(+id));

		if(isNullOrUndefined(this.orderService.completedOrder) && !this.activatedRoute.snapshot.queryParamMap.has("id")){
			this.error$.next(true);
		}
	}

	update(id: number) {
		this.loading$.next(true);
		this.error$.next(undefined);
		this.orderService.getById(id)
			.subscribe(
				value => {
					this.order$.next(value);
					this.loading$.next(false);
				},
				error => {
					console.error(error);
					this.error$.next(error);
					this.loading$.next(false);
				}
			);
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
		this.orderService.completedOrder = null;
		this.onDestroy$.next(true);
	}


}
