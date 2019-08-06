import {Component, OnDestroy, OnInit} from "@angular/core";
import {WindowService} from "../../shared/services/window.service";
import {OrderManagementService} from "./order-management.service";
import {SortingOption, SortingOptionHelper} from "../../shared/model/sorting-option";
import {Direction, Sort} from "../../shared/model/api/sort";
import {Order} from "../../shared/model/order";
import {ActivatedRoute, Router} from "@angular/router";
import {Subject} from "rxjs";
import {FilterOption, FilterOptionType} from "../../shared/search/filter-options/filter-option";
import {DateRangeFilterOption} from "../../shared/search/filter-options/date-range-filter-option";
import {ShopItemFilterOption} from "../../shared/search/filter-options/shop-item-filter-option";
import {EventService} from "../../shared/services/api/event.service";
import {MultiFilterOption} from "../../shared/search/filter-options/multi-filter-option";
import {orderStatusMap} from "../../shared/model/order-status";
import {paymentMethodList} from "../../shop/checkout/payment/payment-method";

@Component({
	selector: "memo-order-management",
	templateUrl: "./order-management.component.html",
	styleUrls: ["./order-management.component.scss"],
	providers: [OrderManagementService]
})
export class OrderManagementComponent implements OnInit, OnDestroy {
	sortingOptions: SortingOption<any>[] = orderSortingOptions;
	filterOptions: FilterOption<FilterOptionType>[] = [
		new DateRangeFilterOption(
			"timeStamp",
			"Datum",
		),
		new ShopItemFilterOption(
			"eventId",
			"Nach Item filtern",
			id => this.itemService.getById(id),
		),
		new MultiFilterOption(
			"status",
			"Bestellstatus",
			Object.keys(orderStatusMap)
				.map(key => ({
					key,
					label: orderStatusMap[key].label,
					query: [{key: "status", value: orderStatusMap[key].value}]
				}))
		),
		new MultiFilterOption(
			"method",
			"Bezahlmethoden",
			paymentMethodList()
				.map(paymentMethod => ({
					key: paymentMethod,
					label: paymentMethod,
					query: [{key: "method", value: paymentMethod}]
				}))
		)
	];


	onDestroy$ = new Subject<any>();
	pageIndex = (+this.activatedRoute.snapshot.queryParamMap.get("page") || 1) - 1;
	pageSize = (+this.activatedRoute.snapshot.queryParamMap.get("pageSize") || 10);

	constructor(private windowService: WindowService,
				private activatedRoute: ActivatedRoute,
				private itemService: EventService,
				private router: Router,
				public orderOverviewService: OrderManagementService) {
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
		this.onDestroy$.next(true);
	}

	linkToCreatePage() {
		this.router.navigate(["..", "management", "create", "orders"]);
	}

}


export const orderSortingOptions: SortingOption<Order>[] = [
	SortingOptionHelper.build(
		"Datum neueste - älteste",
		Sort.by(Direction.DESCENDING, "timeStamp"),
		"Neu - Alt"
	),
	SortingOptionHelper.build(
		"Datum älteste - neueste",
		Sort.by(Direction.ASCENDING, "timeStamp"),
		"Alt - Neu"
	)
];
