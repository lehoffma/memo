import {Component, Input, OnInit} from "@angular/core";

@Component({
	selector: "memo-merch-stock-status-chart",
	templateUrl: "./merch-stock-status-chart.component.html",
	styleUrls: ["./merch-stock-status-chart.component.scss"]
})
export class MerchStockStatusChartComponent implements OnInit {
	@Input() data: { name: string, value: number }[];


	customColors: { name: string; value: string }[] = [
		{name: "Ausverkauft", value: "#d32f2f"},
		{name: "Knapp", value: "#3f51b5"},
		{name: "Genug", value: "#43a047"},
	];

	constructor() {
	}

	ngOnInit() {
	}

}
