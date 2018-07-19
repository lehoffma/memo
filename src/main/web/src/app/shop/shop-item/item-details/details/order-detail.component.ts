import {Component, OnDestroy, OnInit} from "@angular/core";
import {BehaviorSubject, combineLatest, Subscription} from "rxjs";
import {filter, map, mergeMap, tap} from "rxjs/operators";
import {ActivatedRoute} from "@angular/router";
import {OrderService} from "../../../../shared/services/api/order.service";
import {Order} from "../../../../shared/model/order";
import {ConfirmationDialogService} from "../../../../shared/services/confirmation-dialog.service";
import {LogInService} from "../../../../shared/services/api/login.service";
import {OrderStatus} from "../../../../shared/model/order-status";
import {OrderedItemService} from "../../../../shared/services/api/ordered-item.service";
import {userPermissions} from "../../../../shared/model/user";
import {Permission} from "../../../../shared/model/permission";

@Component({
	selector: "memo-order-detail",
	template: `
		<memo-order-renderer *ngIf="_order$ | async as order; else loading"
							 [withShow]="false"
							 [withActions]="canEdit$ | async"
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
		:host {
			margin-bottom: 1rem;
			display: block;
		}

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
			max-width: 500px;
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
		this.loginService.currentUser$,
		this._order$
	)
		.pipe(
			map(([user, order]) => {
				return user && order.items.some(item => item.status !== OrderStatus.CANCELLED) && user.id === order.user;
			})
		);

	canEdit$ = this.loginService.currentUser$.pipe(
		filter(user => user !== null),
		map(user => userPermissions(user).funds >= Permission.write),
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
