import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit} from "@angular/core";
import {Observable, of} from "rxjs";
import {StockOverviewService, StockState} from "./stock-overview.service";
import {catchError, map} from "rxjs/operators";

@Component({
	selector: "memo-stock-overview",
	templateUrl: "./stock-overview.component.html",
	styleUrls: ["./stock-overview.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class StockOverviewComponent implements OnInit {

	error: any;
	state$: Observable<StockState> = this.stockOverviewService.state().pipe(
		catchError(error => {
			this.error = error;
			console.error(error);
			return of(null);
		})
	);

	data$: Observable<{ name: string, value: number }[]> = this.state$.pipe(
		map((state) => {
			return [
				{
					name: "Ausverkauft",
					value: state.soldOut
				},
				{
					name: "Knapp",
					value: state.warning
				},
				{
					name: "Genug",
					value: state.ok
				}
			]
		})
	);

	public toChartData(state: StockState): { name: string, value: number }[] {
		if(!state){
			return null;
		}
		return [
			{
				name: "Ausverkauft",
				value: state.soldOut
			},
			{
				name: "Knapp",
				value: state.warning
			},
			{
				name: "Genug",
				value: state.ok
			}
		];
	}

	constructor(public stockOverviewService: StockOverviewService,
				private cdRef: ChangeDetectorRef) {
		this.data$.subscribe(it => {
			console.log(it);
			this.cdRef.detectChanges();
		});
	}

	ngOnInit() {
	}

}
