import {Component, Input, OnInit} from "@angular/core";
import {BehaviorSubject} from "rxjs";
import {BreakpointObserver} from "@angular/cdk/layout";
import {map, takeUntil} from "rxjs/operators";
import {DestroyableComponent} from "../../../util/destroyable.component";

@Component({
	selector: "memo-merch-stock-status-chart",
	templateUrl: "./merch-stock-status-chart.component.html",
	styleUrls: ["./merch-stock-status-chart.component.scss"]
})
export class MerchStockStatusChartComponent extends DestroyableComponent implements OnInit {
	@Input() data: { name: string, value: number }[];

	legendPosition$: BehaviorSubject<string> = new BehaviorSubject<string>("right");

	customColors: { name: string; value: string }[] = [
		{name: "Ausverkauft", value: "#d32f2f"},
		{name: "Knapp", value: "#3f51b5"},
		{name: "Genug", value: "#43a047"},
	];

	constructor(private breakpointObserver: BreakpointObserver) {
		super();

		this.breakpointObserver.observe([
			"(min-width: 650px)"
		]).pipe(
			map(result => !result.matches),
			takeUntil(this.onDestroy$)
		)
			.subscribe(isMobile => {
				this.legendPosition$.next(isMobile ? "bottom" : "right");
			})
	}

	ngOnInit() {
	}

}
