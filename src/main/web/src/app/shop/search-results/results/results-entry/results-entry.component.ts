import {Component, Input, OnInit} from "@angular/core";
import {Event} from "../../../shared/model/event";

@Component({
	selector: "memo-results-entry",
	templateUrl: "./results-entry.component.html",
	styleUrls: ["./results-entry.component.scss"]
})
export class ResultsEntryComponent implements OnInit {
	@Input() result: Event;

	constructor() {
	}

	ngOnInit() {
	}

}
