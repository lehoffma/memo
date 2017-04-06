import {Component, Input, OnInit} from "@angular/core";
import {Observable} from "rxjs";

@Component({
	selector: "memo-item-table",
	templateUrl: "./item-table.component.html",
	styleUrls: ["./item-table.component.scss"]
})
export class ItemTableComponent implements OnInit {
	@Input() objectObservable: Observable<any> = Observable.of();

	filteredAttributes = [];

	constructor() {
	}

	ngOnInit() {
		this.filteredAttributes = Object.assign([], [
			"_id", "_title", "_description", "_expectedRole", "_imagePath", "_priceMember", "_participants",
			"_meetingPoint", "_destination", "_colors", "_sizeTable"]);
	}

}
