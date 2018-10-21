import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {Dimension, WindowService} from "../../shared/services/window.service";
import {OrderOverviewService} from "./order-overview.service";
import {MatPaginator} from "@angular/material";
import {SortingOption, SortingOptionHelper} from "../../shared/model/sorting-option";
import {Direction, Sort} from "../../shared/model/api/sort";
import {Order} from "../../shared/model/order";
import {ActivatedRoute, ParamMap, Router} from "@angular/router";
import {takeUntil} from "rxjs/operators";
import {Subject} from "rxjs";
import {QueryParameterService} from "../../shared/services/query-parameter.service";

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
	pageIndex = 0;
	pageSize = 10;

	@ViewChild(MatPaginator) paginator: MatPaginator;

	constructor(private windowService: WindowService,
				private activatedRoute: ActivatedRoute,
				private router: Router,
				private queryParameterService: QueryParameterService,
				public orderOverviewService: OrderOverviewService) {
		this.windowService.dimension$.pipe(takeUntil(this.onDestroy$))
			.subscribe(dimensions => this.onResize(dimensions));
	}

	ngOnInit() {
		this.orderOverviewService.dataSource.paginator = this.paginator;
		this.initPaginatorFromUrl(this.activatedRoute.snapshot.queryParamMap);
		this.writePaginatorUpdatesToUrl(this.router);
	}

	ngOnDestroy(): void {
		this.onDestroy$.next();
		this.onDestroy$.complete();
	}


	initPaginatorFromUrl(queryParamMap: ParamMap) {
		if (queryParamMap.has("page")) {
			const page = +queryParamMap.get("page");
			const pageSize = queryParamMap.get("pageSize");
			this.pageIndex = (page || 1) - 1;
			this.pageSize = (+(pageSize || 10));
		}
	}

	writePaginatorUpdatesToUrl(router: Router) {
		this.paginator.page.pipe(
			takeUntil(this.onDestroy$)
		)
			.subscribe(event => {
				const newQueryParams = {
					page: event.pageIndex + 1,
					pageSize: event.pageSize
				};
				const updatedParams = this.queryParameterService
					.updateQueryParams(this.activatedRoute.snapshot.queryParamMap, newQueryParams);
				router.navigate([], {queryParams: updatedParams})
			})
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
