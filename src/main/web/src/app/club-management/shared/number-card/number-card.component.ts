import {ChangeDetectionStrategy, Component, HostBinding, Input, OnInit} from "@angular/core";
import {Params} from "@angular/router";
import {ThemePalette} from "@angular/material";
import {IconProp} from "@fortawesome/fontawesome-svg-core";

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

	@HostBinding("class.with-change")
	@Input() withChange: boolean = true;
	@Input() matIcon: string;
	@Input() faIcon: IconProp;
	@Input() render: (input: number) => string = input => "" + input;
	@Input() positiveThemeColor: ThemePalette = "primary";
	@Input() negativeThemeColor: ThemePalette = "warn";
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

	@HostBinding("class.positive-primary")
	get hasPositivePrimaryColor() {
		return this.positiveThemeColor === "primary";
	}

	@HostBinding("class.positive-accent")
	get hasPositiveAccentColor() {
		return this.positiveThemeColor === "accent";
	}

	@HostBinding("class.positive-warn")
	get hasPositiveWarnColor() {
		return this.positiveThemeColor === "warn";
	}

	@HostBinding("class.negative-primary")
	get hasNegativePrimaryColor() {
		return this.negativeThemeColor === "primary";
	}

	@HostBinding("class.negative-accent")
	get hasNegativeAccentColor() {
		return this.negativeThemeColor === "accent";
	}

	@HostBinding("class.negative-warn")
	get hasNegativeWarnColor() {
		return this.negativeThemeColor === "warn";
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
