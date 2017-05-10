import {Component, Input, OnInit} from "@angular/core";
import {Event} from "../../../shop/shared/model/event";

@Component({
	selector: "memo-my-tours-entry",
	templateUrl: "./my-tours-entry.component.html",
	styleUrls: ["./my-tours-entry.component.scss"]
})
export class MyToursEntryComponent implements OnInit {
	@Input() event: Event;

	constructor() {
	}

	ngOnInit() {
	}

}
