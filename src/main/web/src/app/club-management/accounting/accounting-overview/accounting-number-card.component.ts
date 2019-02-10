import {Component, HostBinding, Input, OnInit} from "@angular/core";

@Component({
	selector: "memo-accounting-number-card",
	templateUrl: "./accounting-number-card.component.html",
	styleUrls: ["./accounting-number-card.component.scss"]
})
export class AccountingNumberCardComponent implements OnInit {
	@Input() title;
	@Input() total;
	@Input() change;

	@HostBinding("class.negative")
	get isNegative() {
		return this.total && this.total < 0;
	}

	constructor() {
	}

	ngOnInit() {
	}

}
