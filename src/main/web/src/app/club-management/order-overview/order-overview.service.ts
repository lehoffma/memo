import {Injectable, OnDestroy} from "@angular/core";
import {Order} from "../../shared/model/order";
import {combineLatest, Observable, Subject} from "rxjs";
import {NavigationService} from "../../shared/services/navigation.service";
import {distinctUntilChanged, filter, map, mergeMap, tap} from "rxjs/operators";
import {Router} from "@angular/router";
import {OrderService} from "../../shared/services/api/order.service";
import {ConfirmationDialogService} from "../../shared/services/confirmation-dialog.service";
import {MatSnackBar} from "@angular/material";
import {LogInService} from "../../shared/services/api/login.service";
import {Filter} from "../../shared/model/api/filter";
import {Direction, Sort} from "../../shared/model/api/sort";
import {statusToInt} from "../../shared/model/order-status";
import {getAllQueryValues} from "../../shared/model/util/url-util";
import {ManualPagedDataSource} from "../../shared/utility/material-table/manual-paged-data-source";
import {QueryParameterService} from "../../shared/services/query-parameter.service";

@Injectable()
export class OrderOverviewService implements OnDestroy {
	sortedBy$: Observable<Sort> = this.navigationService.queryParamMap$
		.pipe(
			map(paramMap => paramMap.has("sortBy") && paramMap.has("direction")
				? Sort.by(paramMap.get("direction"), getAllQueryValues(paramMap, "sortBy").join(","))
				: Sort.by(Direction.DESCENDING, "timeStamp")),
			distinctUntilChanged((a, b) => Sort.equal(a, b))
		);

	filteredBy$: Observable<Filter> = this.navigationService.queryParamMap$
		.pipe(
			map(paramMap => {
				let paramObject = {};
				paramMap.keys
					.filter(key => !["page", "pageSize", "sortBy", "direction"].includes(key))
					.forEach(key => {
						let value = getAllQueryValues(paramMap, key).join(",");

						if (key === "status") {
							value = getAllQueryValues(paramMap, key).map(it => statusToInt(it as any)).join(",");
						}

						paramObject[key] = value;
					});
				return Filter.by(paramObject);
			}),
			distinctUntilChanged((a, b) => Filter.equal(a, b))
		);


	userCanAddOrders$ = this.loginService.getActionPermissions("funds")
		.pipe(
			map(permission => permission.Hinzufuegen)
		);

	public dataSource: ManualPagedDataSource<Order> = new ManualPagedDataSource<Order>(this.orderService);
	loading$ = this.dataSource.isLoading$;

	orders$: Observable<Order[]> = this.dataSource.connect();

	public resetPage = new Subject();

	constructor(private navigationService: NavigationService,
				private loginService: LogInService,
				private snackBar: MatSnackBar,
				private router: Router,
				private queryParameterService: QueryParameterService,
				private confirmationDialogService: ConfirmationDialogService,
				private orderService: OrderService) {
		this.dataSource.isExpandable = false;
		this.dataSource.filter$ = this.filteredBy$;
		this.dataSource.sort$ = this.sortedBy$;

		this.dataSource.initPaginatorFromUrl(this.navigationService.queryParamMap$.getValue());
		this.dataSource.writePaginatorUpdatesToUrl(this.router,
			queryParams => this.queryParameterService
				.updateQueryParams(this.navigationService.queryParamMap$.getValue(), queryParams));


		this.dataSource.updateOn(
			combineLatest(
				this.filteredBy$,
				this.sortedBy$
			).pipe(
				tap(() => this.resetPage.next()),
			)
		);

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
