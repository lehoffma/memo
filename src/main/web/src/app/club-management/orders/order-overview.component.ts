import {ChangeDetectorRef, Component, OnDestroy, OnInit} from "@angular/core";
import {OrderOverviewService, PopularColor, PopularItem, PopularSize} from "./order-overview.service";
import {Observable, Subject, timer} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {OverTimeData} from "./orders-over-time-chart/orders-over-time-chart.component";

@Component({
	selector: "memo-order-overview",
	templateUrl: "./order-overview.component.html",
	styleUrls: ["./order-overview.component.scss"]
})
export class OrderOverviewComponent implements OnDestroy {
	openOrders$: Observable<{ open: number; openChange: number }> = this.orderOverviewService.openOrders();
	totalOrders$: Observable<{ total: number; totalChange: number }> = this.orderOverviewService.totalOrders();
	ordersOverTime$: Observable<OverTimeData[]> = this.orderOverviewService.ordersOverTime();
	popularSizes$: Observable<PopularSize[]> = this.orderOverviewService.popularSizes();
	popularItems$: Observable<PopularItem[]> = this.orderOverviewService.popularItems();
	popularColors$: Observable<PopularColor[]> = this.orderOverviewService.popularColors();

	onDestroy$ = new Subject();
	constructor(public orderOverviewService: OrderOverviewService,
				private cdRef: ChangeDetectorRef) {
		//to update the "last updated:" sign
		timer(5000, 15000)
			.pipe(takeUntil(this.onDestroy$))
			.subscribe(it => this.cdRef.detectChanges());
	}

	ngOnDestroy(): void {
		this.onDestroy$.next(true);
	}

}
