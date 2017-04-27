import {Component, Input, OnInit} from "@angular/core";

@Component({
	selector: "memo-results",
	templateUrl: "./results.component.html",
	styleUrls: ["./results.component.scss"]
})
export class ResultsComponent implements OnInit {
	@Input() events: Event[];

	constructor() {
	}

	ngOnInit() {
	}

}
