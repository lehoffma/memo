import {ChangeDetectorRef, Component, OnDestroy, OnInit} from "@angular/core";
import {OrderOverviewService} from "./order-overview.service";
import {Observable, Subject, timer} from "rxjs";
import {takeUntil} from "rxjs/operators";

@Component({
	selector: "memo-order-overview",
	templateUrl: "./order-overview.component.html",
	styleUrls: ["./order-overview.component.scss"]
})
export class OrderOverviewComponent implements OnDestroy {
	openOrders$: Observable<{ open: number; openChange: number }> = this.orderOverviewService.openOrders();
	totalOrders$: Observable<{ total: number; totalChange: number }> = this.orderOverviewService.totalOrders();

	onDestroy$ = new Subject();
	constructor(public orderOverviewService: OrderOverviewService,
				private cdRef: ChangeDetectorRef) {
		timer(5000, 15000)
			.pipe(takeUntil(this.onDestroy$))
			.subscribe(it => this.cdRef.detectChanges());
	}

	ngOnDestroy(): void {
		this.onDestroy$.next(true);
	}

}
