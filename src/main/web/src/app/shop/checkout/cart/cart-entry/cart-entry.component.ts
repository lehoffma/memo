import {Component, Input, OnInit} from "@angular/core";


@Component({
	selector: "memo-cart-entry",
	templateUrl: "./cart-entry.component.html",
	styleUrls: ["./cart-entry.component.scss"]
})
export class CartEntryComponent implements OnInit {
	@Input() event;
	amountOptions = []
		.map(amount => {

		})

	constructor() {
	}

	ngOnInit() {
	}

}

