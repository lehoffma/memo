import {Component, OnDestroy, OnInit} from "@angular/core";
import {BehaviorSubject, combineLatest, Subscription} from "rxjs";
import {map, mergeMap} from "rxjs/operators";
import {ActivatedRoute} from "@angular/router";
import {OrderService} from "../../../../shared/services/api/order.service";
import {Order} from "../../../../shared/model/order";
import {ConfirmationDialogService} from "../../../../shared/services/confirmation-dialog.service";
import {LogInService} from "../../../../shared/services/api/login.service";
import {OrderStatus} from "../../../../shared/model/order-status";
import {OrderedItemService} from "../../../../shared/services/api/ordered-item.service";

@Component({
	selector: "memo-order-detail",
	template: `
		<memo-order-renderer *ngIf="_order$ | async as order; else loading"
							 [withActions]="true"
							 [withRemove]="false"
							 [orderEntry]="order">

		</memo-order-renderer>

		<div class="actions" *ngIf="canCancel$ | async">
			<button mat-raised-button color="warn" (click)="cancelOrder()">
				Stornieren
			</button>
		</div>

		<div class="error-message" *ngIf="error">
			Das Stornieren ist fehlgeschlagen. Probier es in einigen Momenten noch mal.
		</div>

		<ng-template #loading>
			<div class="loader-wrapper">
				<div class="loader"></div>
			</div>
		</ng-template>
	`,
	styles: [`
		.actions {
			max-width: 500px;
			display: flex;
			justify-content: center;
			margin: 1rem auto auto;
		}

		.error-message {
			display: flex;
			max-width: 500px;
			margin: 1rem auto auto;
			justify-content: center;
			text-align: center;
		}

		memo-order-renderer {
			margin: 0;
		}

		@media all and (min-width: 500px) {
			.actions {
				justify-content: flex-end;
			}

			memo-order-renderer {
				margin: 1rem auto auto;
			}
		}
	`]
})

export class OrderDetailComponent implements OnInit, OnDestroy {

	_order$: BehaviorSubject<Order> = new BehaviorSubject(null);

	subscriptions: Subscription[] = [];

	canCancel$ = combineLatest(
		this.loginService.accountObservable,
		this._order$
	)
		.pipe(
			map(([userId, order]) => {
				return order.items.some(item => item.status !== OrderStatus.CANCELLED) && userId === order.user;
			})
		);

	error: any;

	constructor(private activatedRoute: ActivatedRoute,
				private loginService: LogInService,
				private confirmationDialogService: ConfirmationDialogService,
				private orderedItemService: OrderedItemService,
				private orderService: OrderService) {

		this.subscriptions.push(
			this.activatedRoute.params
				.pipe(
					mergeMap(params => this.orderService.valueChanges(+params["id"]))
				)
				.subscribe(this._order$)
		);
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(it => it.unsubscribe());
	}

	cancelOrder() {
		this.confirmationDialogService.open("Möchtest du diese Bestellung wirklich stornieren?", () => {
			this.orderedItemService.cancelOrder(this._order$.getValue())
				.subscribe(
					success => {
					},
					error => {
						this.error = error;
					}
				)
		});
	}

}
