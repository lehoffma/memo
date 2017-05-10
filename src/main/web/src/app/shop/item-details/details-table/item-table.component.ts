import {Component, Input, OnInit} from "@angular/core";
import {EventOverviewKey} from "../container/overview/event-overview-key";
import {Event} from "../../shared/model/event";

@Component({
	selector: "memo-item-table",
	templateUrl: "./item-table.component.html",
	styleUrls: ["./item-table.component.scss"]
})
export class ItemTableComponent implements OnInit {
	@Input() event: Event;

	get tableCategories(): EventOverviewKey[] {
		return this.event ? this.event.detailsTableKeys : [];
	}

	constructor() {
	}

	ngOnInit() {
	}
}
