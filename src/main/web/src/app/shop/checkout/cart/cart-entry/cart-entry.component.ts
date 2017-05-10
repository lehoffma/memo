import {Component, Input, OnInit} from "@angular/core";


@Component({
	selector: "memo-cart-entry",
	templateUrl: "./cart-entry.component.html",
	styleUrls: ["./cart-entry.component.scss"]
})
export class CartEntryComponent implements OnInit {
	@Input() event;
	amountOptions=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,15]
	constructor() {
	}

	ngOnInit() {
	}

}

