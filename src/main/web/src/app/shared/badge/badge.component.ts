import {Component, Input, OnInit} from "@angular/core";

@Component({
	selector: "memo-badge",
	templateUrl: "./badge.component.html",
	styleUrls: ["./badge.component.scss"]
})
export class BadgeComponent implements OnInit {

	@Input() value = 0;

	constructor() {

	}

	get amount(): string {
		return this.value > 99 ? "99+" : this.value + "";
	}

	ngOnInit() {
	}

}
