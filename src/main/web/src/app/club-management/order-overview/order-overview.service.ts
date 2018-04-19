import {Injectable} from "@angular/core";
import {Order} from "../../shared/model/order";
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {NavigationService} from "../../shared/services/navigation.service";
import {defaultIfEmpty, filter, map, mergeMap, tap} from "rxjs/operators";
import {isAfter, isBefore, isEqual, parse} from "date-fns";
import {ParamMap, Router} from "@angular/router";
import {OrderService} from "../../shared/services/api/order.service";
import {attributeSortingFunction, dateSortingFunction, SortingFunction} from "../../util/util";
import {ColumnSortingEvent} from "../../shared/utility/expandable-table/column-sorting-event";
import {combineLatest} from "rxjs/observable/combineLatest";
import {ConfirmationDialogService} from "../../shared/services/confirmation-dialog.service";
import {MatSnackBar} from "@angular/material";
import {LogInService} from "../../shared/services/api/login.service";

@Injectable()
export class OrderOverviewService {
	public _sortBy$ = new BehaviorSubject<ColumnSortingEvent<Order>>({
		key: "timeStamp",
		descending: true
	});

	private _orders$ = new BehaviorSubject<Order[]>([]);
	orders$: Observable<Order[]> = combineLatest(
		this._orders$,
		this._sortBy$,
		this.navigationService.queryParamMap$
	)
		.pipe(
			map(([data, sortBy, queryParamMap]: [Order[], ColumnSortingEvent<Order>, ParamMap]) => data
				.filter(dataObject => this.satisfiesFilter(dataObject, queryParamMap))
				.sort((a, b) => this.comparator(sortBy)(a, b))),
			map(data => [...data]),
			defaultIfEmpty([]),
		);

	userCanAddOrders$ = this.loginService.getActionPermissions("funds")
		.pipe(
			map(permission => permission.Hinzufuegen)
		);
	dataSubscription;
	loading = false;

	constructor(private navigationService: NavigationService,
				private loginService: LogInService,
				private snackBar: MatSnackBar,
				private router: Router,
				private confirmationDialogService: ConfirmationDialogService,
				private orderService: OrderService) {
		this.initData();

	}

	initData() {
		if (this.dataSubscription) {
			console.debug("cancelling previous subscription");
			this.dataSubscription.unsubscribe();
		}

		this.loading = true;
		this.dataSubscription = this.orderService.search("").subscribe(it => {
			this.loading = false;
			this._orders$.next(it)
		});
	}


	/**
	 * Extracts the dateRange from the queryParameters so it can be used in the API call
	 * @returns {{minDate: Date; maxDate: Date}}
	 */
	private extractDateRangeFromQueryParams(queryParamMap: ParamMap): { minDate: Date, maxDate: Date } {
		const from = queryParamMap.has("from") ? parse(queryParamMap.get("from")) : parse("1970-01-01");
		const to = queryParamMap.has("to") ? parse(queryParamMap.get("to")) : parse("2100-01-01");

		//default: this month
		return {
			minDate: from,
			maxDate: to
		};
	}

	/**
	 *
	 * @param order
	 * @param {ParamMap} queryParamMap
	 * @returns {boolean}
	 */
	satisfiesFilter(order: Order, queryParamMap: ParamMap): boolean {
		let orderRemains = true;
		//todo this should probably happen on the server instead

		const {minDate, maxDate} = this.extractDateRangeFromQueryParams(queryParamMap);
		orderRemains = orderRemains && (
			isAfter(order.timeStamp, minDate) || isEqual(order.timeStamp, minDate)
		) && (isBefore(order.timeStamp, maxDate) || isEqual(order.timeStamp, maxDate));

		if (queryParamMap.has("eventIds")) {
			orderRemains = orderRemains && queryParamMap.getAll("eventIds")
				.some(id => order.items
					.some(item => item.item.id === +id)
				);
		}
		if (queryParamMap.has("userIds")) {
			orderRemains = orderRemains && queryParamMap.getAll("userIds")
				.some(id => order.user === +id);
		}
		orderRemains = orderRemains && queryParamMap.getAll("status")
			.some(status => order.items.some(it => it.status === status));
		orderRemains = orderRemains && queryParamMap.getAll("payment")
			.some(method => "" + order.method === method);

		return orderRemains;
	}

	comparator(sortBy: ColumnSortingEvent<Order>, ...options): SortingFunction<Order> {
		if (sortBy.key === "timeStamp") {
			return dateSortingFunction<Order>(order => order.timeStamp, sortBy.descending);
		}
		return attributeSortingFunction(sortBy.key, sortBy.descending);
	}


	removeOrder(order: Order) {
		this.confirmationDialogService.openDialog("Möchtest du diese Bestellung wirklich löschen?")
			.pipe(
				filter(yes => yes),
				mergeMap(yes => this.orderService.remove(order.id)),
				tap(() => this.initData())
			)
			.subscribe(() => {
				this.snackBar.open("Das Löschen der Bestellung war erfolgreich.", "Schließen");
			}, error => {
				console.error(error);
				this.snackBar.open("Ein Fehler ist aufgetreten!", "Nochmal?", {
					duration: 3000
				})
					.onAction()
					.subscribe(() => this.removeOrder(order));
			});
	}
}
