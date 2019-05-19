import {Component, HostBinding, Input, OnInit} from "@angular/core";

@Component({
	selector: "memo-number-card",
	templateUrl: "./number-card.component.html",
	styleUrls: ["./number-card.component.scss"]
})
export class NumberCardComponent implements OnInit {
	@Input() title: string;
	@Input() total: number;
	@Input() change: number;
	@Input() matIcon: string;
	@Input() faIcon: string;
	@Input() render: (input: number) => string = input => "" + input;

	@HostBinding("class.negative")
	get isNegative() {
		return this.total && this.total < 0;
	}

	constructor() {
	}

	ngOnInit() {
	}

}
