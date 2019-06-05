import {Component, OnInit} from "@angular/core";
import {combineLatest, Observable, of} from "rxjs";
import {StockOverviewService} from "./stock-overview.service";
import {map} from "rxjs/operators";

@Component({
	selector: "memo-stock-overview",
	templateUrl: "./stock-overview.component.html",
	styleUrls: ["./stock-overview.component.scss"]
})
export class StockOverviewComponent implements OnInit {
	soldOut$: Observable<number> = of(10);
	warning$: Observable<number> = of(5);
	noProblem$: Observable<number> = of(20);

	data$: Observable<{ name: string, value: number }[]> = combineLatest([
		this.soldOut$,
		this.warning$,
		this.noProblem$
	]).pipe(
		map(([soldOut, warning, noProblem]) => {
			return [
				{
					name: "Ausverkauft",
					value: soldOut
				},
				{
					name: "Knapp",
					value: warning
				},
				{
					name: "Genug",
					value: noProblem
				}
			]
		})
	);

	constructor(public stockOverviewService: StockOverviewService) {
	}

	ngOnInit() {
	}

}
