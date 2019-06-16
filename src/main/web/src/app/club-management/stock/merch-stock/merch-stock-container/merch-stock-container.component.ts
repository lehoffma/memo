import {Component, OnInit} from "@angular/core";
import {Observable, of, Subject} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import {catchError, map, mergeMap, switchMap} from "rxjs/operators";
import {StockService} from "../../../../shared/services/api/stock.service";
import {stockAmountToStatus, StockEntry} from "../merch-stock-entry/stock-entry";
import {EventService} from "../../../../shared/services/api/event.service";
import {Merchandise} from "../../../../shop/shared/model/merchandise";
import {UserService} from "../../../../shared/services/api/user.service";
import {LogInService} from "../../../../shared/services/api/login.service";
import {userPermissions} from "../../../../shared/model/user";
import {Permission} from "../../../../shared/model/permission";

@Component({
	selector: "memo-merch-stock-container",
	templateUrl: "./merch-stock-container.component.html",
	styleUrls: ["./merch-stock-container.component.scss"]
})
export class MerchStockContainerComponent implements OnInit {
	merchStock$: Observable<StockEntry> = this.activatedRoute.params
		.pipe(
			switchMap(params => this.itemService.valueChanges<Merchandise>(+params["id"])),
			mergeMap(item => this.stockService.getByEventId(item.id)
				.pipe(
					map(stock => stock.map(it => ({
						...it,
						status: stockAmountToStatus(it.amount),
					}))),
					map(stock => ({
						item,
						stock
					})),
					catchError(error => {
						this.error = error;
						return of(null);
					})
				)
			),
		);

	canEdit$: Observable<boolean> = this.loginService.currentUser$
		.pipe(
			map(user => userPermissions(user).stock >= Permission.write)
		);

	error: any;

	onDestroy$ = new Subject();

	constructor(private activatedRoute: ActivatedRoute,
				private itemService: EventService,
				private userService: UserService,
				private loginService: LogInService,
				private stockService: StockService) {

	}

	ngOnInit() {
	}

}
