import {Component, Input, OnInit} from "@angular/core";

@Component({
	selector: "memo-results-category",
	templateUrl: "./results-category.component.html",
	styleUrls: ["./results-category.component.scss"]
})
export class ResultsCategoryComponent implements OnInit {
	@Input() events: Event[];
	@Input() title: string = "";

	constructor() {
	}

	ngOnInit() {
	}

}
