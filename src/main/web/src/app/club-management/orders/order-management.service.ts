import {Injectable, OnDestroy} from "@angular/core";
import {Order} from "../../shared/model/order";
import {BehaviorSubject, combineLatest, Observable, Subject} from "rxjs";
import {NavigationService} from "../../shared/services/navigation.service";
import {debounceTime, distinctUntilChanged, filter, map, mergeMap, takeUntil, tap} from "rxjs/operators";
import {Router} from "@angular/router";
import {OrderService} from "../../shared/services/api/order.service";
import {ConfirmationDialogService} from "../../shared/services/confirmation-dialog.service";
import {MatSnackBar} from "@angular/material";
import {LogInService} from "../../shared/services/api/login.service";
import {Filter} from "../../shared/model/api/filter";
import {Direction, Sort} from "../../shared/model/api/sort";
import {getAllQueryValues} from "../../shared/model/util/url-util";
import {ManualPagedDataSource} from "../../shared/utility/material-table/manual-paged-data-source";
import {PageRequest} from "../../shared/model/api/page-request";

@Injectable()
export class OrderManagementService implements OnDestroy {
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
						paramObject[key] = value;
					});
				return Filter.by(paramObject);
			}),
			distinctUntilChanged((a, b) => Filter.equal(a, b))
		);

	page$ = new BehaviorSubject(PageRequest.at(
		(+this.navigationService.queryParamMap$.getValue().get("page") || 1) - 1,
		(+this.navigationService.queryParamMap$.getValue().get("pageSize") || 20)
	));

	userCanAddOrders$ = this.loginService.getActionPermissions("funds")
		.pipe(
			map(permission => permission.Hinzufuegen)
		);

	public dataSource: ManualPagedDataSource<Order> = new ManualPagedDataSource<Order>(this.orderService, this.page$);
	loading$ = this.dataSource.isLoading$;

	orders$: Observable<Order[]> = this.dataSource.connect();

	public resetPage = new Subject();

	onDestroy$ = new Subject();

	constructor(private navigationService: NavigationService,
				private loginService: LogInService,
				private snackBar: MatSnackBar,
				private router: Router,
				private confirmationDialogService: ConfirmationDialogService,
				private orderService: OrderService) {
		this.dataSource.isExpandable = false;
		this.dataSource.filter$ = this.filteredBy$;
		this.dataSource.sort$ = this.sortedBy$;

		this.dataSource.initPaginatorFromUrlAndUpdatePage(this.navigationService.queryParamMap$.getValue());
		this.dataSource.writePaginatorUpdatesToUrl(this.router);

		this.dataSource.updateOn(
			combineLatest(
				this.filteredBy$,
				this.sortedBy$
			).pipe(
				debounceTime(100),
				tap(() => this.resetPage.next()),
			)
		);

		this.resetPage.pipe(takeUntil(this.onDestroy$))
			.subscribe(it => this.pageAt(0));
	}


	pageAt(page: number) {
		const currentValue = this.page$.getValue();
		this.page$.next(PageRequest.at(page, currentValue.pageSize));
		this.dataSource.update();
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
		this.onDestroy$.next(true);
	}

}
