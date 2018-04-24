import {Component, OnInit} from "@angular/core";
import {LogInService} from "../../shared/services/api/login.service";
import {OrderService} from "../../shared/services/api/order.service";
import {Order} from "../../shared/model/order";
import {ColumnSortingEvent} from "../../shared/utility/expandable-table/column-sorting-event";
import {attributeSortingFunction, dateSortingFunction} from "../../util/util";
import {SortingOption} from "../../shared/model/sorting-option";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";
import {combineLatest} from "rxjs/observable/combineLatest";
import {empty} from "rxjs/observable/empty";
import {mergeMap, map, catchError, defaultIfEmpty} from "rxjs/operators";
import {_throw} from "rxjs/observable/throw";
import {EMPTY} from "rxjs/internal/observable/empty";

@Component({
	selector: "memo-order-history",
	templateUrl: "./order-history.component.html",
	styleUrls: ["./order-history.component.scss"]
})
export class OrderHistoryComponent implements OnInit {
	sortingOptions: SortingOption<Order>[] = [
		{
			name: "Datum (neu -> alt)",
			queryParameters: {
				sortBy: "timeStamp",
				descending: "true"
			},
		},
		{
			name: "Datum (alt -> neu)",
			queryParameters: {
				sortBy: "timeStamp",
				descending: "false"
			},
		}
	];

	sortBy$: BehaviorSubject<ColumnSortingEvent<Order>> = new BehaviorSubject<ColumnSortingEvent<Order>>({
		key: "timeStamp",
		descending: true
	});

	orders$: Observable<Order[]> = combineLatest(
		this.sortBy$,
		this.loginService
			.accountObservable
			.pipe(
				mergeMap(userId => userId === null
						? _throw(new Error("User is not logged in"))
						: this.orderService.getByUserId(userId)
				)
			)
	)
		.pipe(
			map(([sortBy, orders]) => {
				if (sortBy.key === "timeStamp") {
					return [...orders.sort(dateSortingFunction<Order>(obj => obj.timeStamp, sortBy.descending))];
				}
				return [...orders.sort(attributeSortingFunction<Order>(sortBy.key, sortBy.descending))];
			}),
			catchError(error => {
				console.error(error);
				return EMPTY;
			}),
			defaultIfEmpty([])
		);


	//todo schönere "keine bestellungen" message
	//todo timeline slider

	constructor(private loginService: LogInService,
				private orderService: OrderService) {
	}

	ngOnInit() {
	}

}
