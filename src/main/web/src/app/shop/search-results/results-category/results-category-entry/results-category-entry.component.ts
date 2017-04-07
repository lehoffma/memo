import {Component, Input, OnInit} from "@angular/core";
import {Event} from "../../../shared/model/event";

@Component({
	selector: "memo-results-category-entry",
	templateUrl: "./results-category-entry.component.html",
	styleUrls: ["./results-category-entry.component.scss"]
})
export class ResultsCategoryEntryComponent implements OnInit {
	@Input() result: Event;

	constructor() {
	}

	ngOnInit() {
	}

}
