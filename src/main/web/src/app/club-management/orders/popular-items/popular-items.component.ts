import {Component, Input, OnInit} from "@angular/core";
import {PopularItem} from "../order-overview.service";

@Component({
	selector: "memo-popular-items",
	templateUrl: "./popular-items.component.html",
	styleUrls: ["./popular-items.component.scss"]
})
export class PopularItemsComponent implements OnInit {
	@Input() items: PopularItem[];
	@Input() error: any;

	constructor() {
	}

	ngOnInit() {
	}

}
