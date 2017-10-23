import {Component, OnInit} from "@angular/core";
import {LogInService} from "../../shared/services/api/login.service";
import {OrderService} from "../../shared/services/api/order.service";
import {BehaviorSubject, Observable} from "rxjs/Rx";
import {Order} from "../../shared/model/order";
import {ColumnSortingEvent} from "../../shared/expandable-table/column-sorting-event";
import {attributeSortingFunction, dateSortingFunction} from "../../util/util";
import {SortingOption} from "../../shared/model/sorting-option";

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

	orders$: Observable<Order[]> = Observable.combineLatest(
		this.sortBy$,
		this.loginService
			.accountObservable
			.flatMap(userId => userId === null
				? Observable.throw(new Error("User is not logged in"))
				: this.orderService.getByUserId(userId))
	)
		.map(([sortBy, orders]) => {
			if (sortBy.key === "timeStamp") {
				return [...orders.sort(dateSortingFunction<Order>(obj => obj.timeStamp, sortBy.descending))];
			}
			return [...orders.sort(attributeSortingFunction<Order>(sortBy.key, sortBy.descending))];
		})
		.catch(error => {
			console.error(error);
			return Observable.empty();
		})
		.defaultIfEmpty([]);


	//todo schönere "keine bestellungen" message
	//todo timeline slider

	constructor(private loginService: LogInService,
				private orderService: OrderService) {
	}

	ngOnInit() {
	}

}
