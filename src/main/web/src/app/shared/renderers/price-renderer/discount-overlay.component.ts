import {Component, Inject, OnInit} from "@angular/core";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material";
import {Discount} from "./discount";

@Component({
	selector: "memo-discount-overlay",
	templateUrl: "./discount-overlay.component.html",
	styleUrls: ["./discount-overlay.component.scss"]
})
export class DiscountOverlayComponent implements OnInit {

	basePrice: number;
	price: number;
	discounts: Discount[];

	constructor(public dialogRef: MatDialogRef<DiscountOverlayComponent>,
				@Inject(MAT_DIALOG_DATA) public data: any) {
		this.basePrice = data.basePrice;
		this.price = data.price;
		this.discounts = data.discounts
			.filter(discount => discount.eligible);
	}


	ngOnInit() {
	}

}
