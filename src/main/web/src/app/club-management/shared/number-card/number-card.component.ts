import {ChangeDetectionStrategy, Component, HostBinding, Input, OnInit} from "@angular/core";
import {Params} from "@angular/router";

@Component({
	selector: "memo-number-card",
	templateUrl: "./number-card.component.html",
	styleUrls: ["./number-card.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class NumberCardComponent implements OnInit {
	@Input() title: string;
	@Input() total: number;
	@Input() change: number;
	@Input() matIcon: string;
	@Input() faIcon: string;
	@Input() render: (input: number) => string = input => "" + input;
	@Input() link: string;
	@Input() queryParams: Params;
	@Input() colorSelector: "total" | "change" = "total";

	getColorSelector(): number {
		switch (this.colorSelector) {
			case "change":
				return this.change;
			case "total":
				return this.total
		}
	}

	@HostBinding("class.negative")
	get isNegative() {
		return this.getColorSelector() < 0;
	}

	@HostBinding("class.neutral")
	get isNeutral() {
		return this.getColorSelector() === 0;
	}

	@HostBinding("class.with-link")
	get hasLink() {
		return !!this.link;
	}

	constructor() {
	}

	ngOnInit() {
	}

}
