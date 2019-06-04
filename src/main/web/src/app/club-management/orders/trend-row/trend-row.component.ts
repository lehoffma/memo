import {Component, Input, OnInit} from "@angular/core";
import {Params} from "@angular/router";

@Component({
	selector: "memo-trend-row",
	templateUrl: "./trend-row.component.html",
	styleUrls: ["./trend-row.component.scss"]
})
export class TrendRowComponent implements OnInit {
	@Input() link: string;
	@Input() queryParams: Params;
	@Input() name: string;
	@Input() amount: number;


	constructor() {
	}

	ngOnInit() {
	}

}
