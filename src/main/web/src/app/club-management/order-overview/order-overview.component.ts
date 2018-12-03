import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {Dimension, WindowService} from "../../shared/services/window.service";
import {OrderOverviewService} from "./order-overview.service";
import {MatPaginator} from "@angular/material";
import {SortingOption, SortingOptionHelper} from "../../shared/model/sorting-option";
import {Direction, Sort} from "../../shared/model/api/sort";
import {Order} from "../../shared/model/order";
import {ActivatedRoute} from "@angular/router";
import {map, takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";
import {PageRequest} from "../../shared/model/api/page-request";

@Component({
	selector: "memo-order-overview",
	templateUrl: "./order-overview.component.html",
	styleUrls: ["./order-overview.component.scss"],
	providers: [OrderOverviewService]
})
export class OrderOverviewComponent implements OnInit, OnDestroy {
	showOptions = true;
	mobile = false;

	sortingOptions: SortingOption<any>[] = orderSortingOptions;

	onDestroy$ = new Subject<any>();
	pageIndex = (+this.activatedRoute.snapshot.queryParamMap.get("page") || 1) - 1;
	pageSize = (+this.activatedRoute.snapshot.queryParamMap.get("pageSize") || 10);

	@ViewChild(MatPaginator) paginator: MatPaginator;

	constructor(private windowService: WindowService,
				private activatedRoute: ActivatedRoute,
				public orderOverviewService: OrderOverviewService) {
		this.windowService.dimension$.pipe(takeUntil(this.onDestroy$))
			.subscribe(dimensions => this.onResize(dimensions));
	}

	ngOnInit() {
		this.orderOverviewService.dataSource.setPage(this.paginator.page.pipe(
			map(page => PageRequest.fromMaterialPageEvent(page))
		));
		this.orderOverviewService.dataSource.updateOn(this.paginator.page);
		this.orderOverviewService.resetPage.pipe(takeUntil(this.onDestroy$)).subscribe(() => {
			this.paginator.firstPage();
		});
	}

	ngOnDestroy(): void {
		this.onDestroy$.next();
		this.onDestroy$.complete();
	}

	/**
	 * Updates the columns and way the options are presented depending on the given width/height object
	 * @param {Dimension} dimension the current window dimensions
	 */
	onResize(dimension: Dimension) {
		let mobile = dimension.width < 850;
		this.showOptions = !mobile;
		this.mobile = mobile;
	}
}


export const orderSortingOptions: SortingOption<Order>[] = [
	SortingOptionHelper.build(
		"Datum neueste - älteste",
		Sort.by(Direction.DESCENDING, "timeStamp")
	),
	SortingOptionHelper.build(
		"Datum älteste - neueste",
		Sort.by(Direction.ASCENDING, "timeStamp")
	)
];
