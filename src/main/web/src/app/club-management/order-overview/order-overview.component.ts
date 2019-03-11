import {Component, OnDestroy, OnInit} from "@angular/core";
import {WindowService} from "../../shared/services/window.service";
import {OrderOverviewService} from "./order-overview.service";
import {SortingOption, SortingOptionHelper} from "../../shared/model/sorting-option";
import {Direction, Sort} from "../../shared/model/api/sort";
import {Order} from "../../shared/model/order";
import {ActivatedRoute} from "@angular/router";
import {Subject} from "rxjs";
import {FilterOption, FilterOptionType} from "../../shared/search/filter-options/filter-option";
import {DateRangeFilterOption} from "../../shared/search/filter-options/date-range-filter-option";
import {ShopItemFilterOption} from "../../shared/search/filter-options/shop-item-filter-option";
import {EventService} from "../../shared/services/api/event.service";

@Component({
	selector: "memo-order-overview",
	templateUrl: "./order-overview.component.html",
	styleUrls: ["./order-overview.component.scss"],
	providers: [OrderOverviewService]
})
export class OrderOverviewComponent implements OnInit, OnDestroy {
	sortingOptions: SortingOption<any>[] = orderSortingOptions;
	filterOptions: FilterOption<FilterOptionType>[] = [
		new DateRangeFilterOption(
			"timestamp",
			"Datum",
		),
		new ShopItemFilterOption(
			"item",
			"Nach Item filtern",
			id => this.itemService.getById(id),

		)
	];


	onDestroy$ = new Subject<any>();
	pageIndex = (+this.activatedRoute.snapshot.queryParamMap.get("page") || 1) - 1;
	pageSize = (+this.activatedRoute.snapshot.queryParamMap.get("pageSize") || 10);

	constructor(private windowService: WindowService,
				private activatedRoute: ActivatedRoute,
				private itemService: EventService,
				public orderOverviewService: OrderOverviewService) {
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
		this.onDestroy$.next(true);
	}

	linkToCreatePage() {
		console.log("todo");
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
