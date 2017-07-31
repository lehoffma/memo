import {Component, Input, OnInit} from "@angular/core";

@Component({
	selector: "memo-item-details-content",
	templateUrl: "./item-details-content.component.html",
	styleUrls: ["./item-details-content.component.scss"],
})
export class ItemDetailsContentComponent implements OnInit {
	@Input() title: string = "";
	@Input() route: string;

	constructor() {
	}

	ngOnInit() {

	}
}
