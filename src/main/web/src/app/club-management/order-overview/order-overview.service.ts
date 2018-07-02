import {Injectable, OnDestroy} from "@angular/core";
import {Order} from "../../shared/model/order";
import {BehaviorSubject, Observable} from "rxjs";
import {NavigationService} from "../../shared/services/navigation.service";
import {filter, map, mergeMap} from "rxjs/operators";
import {Router} from "@angular/router";
import {OrderService} from "../../shared/services/api/order.service";
import {ConfirmationDialogService} from "../../shared/services/confirmation-dialog.service";
import {MatSnackBar} from "@angular/material";
import {LogInService} from "../../shared/services/api/login.service";
import {Filter} from "../../shared/model/api/filter";
import {Sort} from "../../shared/model/api/sort";
import {PageRequest} from "../../shared/model/api/page-request";
import {PageResponse} from "../../shared/model/api/page";
import {PagedDataSource} from "../../shared/utility/material-table/paged-data-source";
import {statusToInt} from "../../shared/model/order-status";

@Injectable()
export class OrderOverviewService implements OnDestroy{
	sortedBy$: Observable<Sort> = this.navigationService.queryParamMap$
		.pipe(
			map(paramMap => paramMap.has("sortBy") && paramMap.has("direction")
				? Sort.by(paramMap.get("direction"), paramMap.getAll("sortBy").join("|"))
				: Sort.none())
		);

	filteredBy$: Observable<Filter> = this.navigationService.queryParamMap$
		.pipe(
			map(paramMap => {
				let paramObject = {};
				paramMap.keys.forEach(key => {
					let value = paramMap.getAll(key).join("|");

					if(key === "status"){
						value = paramMap.getAll(key).map(it => statusToInt(it as any)).join("|");
					}

					paramObject[key] = value;
				});
				return Filter.by(paramObject);
			})
		);


	userCanAddOrders$ = this.loginService.getActionPermissions("funds")
		.pipe(
			map(permission => permission.Hinzufuegen)
		);

	public dataSource: PagedDataSource<Order> = new PagedDataSource<Order>(this.orderService);
	loading$ = this.dataSource.isLoading$;

	orders$: Observable<Order[]> = this.dataSource.connect();

	constructor(private navigationService: NavigationService,
				private loginService: LogInService,
				private snackBar: MatSnackBar,
				private router: Router,
				private confirmationDialogService: ConfirmationDialogService,
				private orderService: OrderService) {
		this.dataSource.isExpandable = false;
		this.dataSource.filter$ = this.filteredBy$;
		this.dataSource.sort$ = this.sortedBy$;
	}

	removeOrder(order: Order) {
		this.confirmationDialogService.openDialog("Möchtest du diese Bestellung wirklich löschen?")
			.pipe(
				filter(yes => yes),
				mergeMap(yes => this.orderService.remove(order.id))
			)
			.subscribe(() => {
				this.snackBar.open("Das Löschen der Bestellung war erfolgreich.", "Schließen");
				this.dataSource.reload();
			}, error => {
				console.error(error);
				this.snackBar.open("Ein Fehler ist aufgetreten!", "Nochmal?", {
					duration: 3000
				})
					.onAction()
					.subscribe(() => this.removeOrder(order));
			});
	}

	ngOnDestroy(): void {
		this.dataSource.disconnect(null);
	}

}
