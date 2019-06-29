import {Component, Input, OnInit} from "@angular/core";
import {Discount} from "./discount";
import {MatDialog} from "@angular/material/dialog";
import {DiscountOverlayComponent} from "./discount-overlay.component";
import {DiscountService} from "../../../shop/shared/services/discount.service";

@Component({
	selector: "memo-price-renderer",
	templateUrl: "./price-renderer.component.html",
	styleUrls: ["./price-renderer.component.scss"]
})
export class PriceRendererComponent implements OnInit {

	_basePrice = 0;
	percentageSaved = 0; //between 0 and 1
	nonEligibleDiscounts: Discount[] = [];
	/**
	 * (Optional) Controls whether the help icon and tooltip should be shown next to the visual representation
	 * of the money saved. The tooltip contains information about how the discount is calculated or how the visitor
	 * could get the discount (i.e. by becoming a user), if he isn't eligible yet.
	 * This will only be shown if discountedPrice is set.
	 * @type {boolean}
	 */
	@Input() showExplanation: boolean = true;
	/**
	 * (Optional) Controls whether there should be a list of links nudging the user towards additional discounts.
	 * @type {boolean}
	 */
	@Input() showDiscountPossibilities: boolean = true;

	/**
	 * (Optional) Additional info to be displayed next to the main price
	 */
	@Input() additionalInfo: string;

	constructor(private matDialog: MatDialog,
				private discountService: DiscountService) {
	}

	_price = 0;

	get price() {
		return this._price;
	}

	/**
	 * (Required) The normal price, without any discounts.
	 * @type {number}
	 */
	@Input() set price(price: number) {
		this._basePrice = price;
		this._price = this.discountService.getDiscountedPrice(price, this.discounts);
		this.percentageSaved = this.calculatePercentage(this._basePrice, this._price);
	}

	_discounts: Discount[] = [];

	get discounts(): Discount[] {
		return this._discounts;
	}

	/**
	 * The discounts applied to the base price. Contains the amount that will be subtracted, a short explanation,
	 * a boolean, which controls whether the user is eligible, and (optionally) a link to apply for the discount,
	 * if the user is not eligible
	 * Example:
	 * {
	 * 		amount: 5.00
	 * 		reason: "Membership-Discount",
	 * 		//...filter properties...
	 * }
	 * @param {Discount[]} discounts
	 */
	@Input() set discounts(discounts: Discount[]) {
		this._discounts = discounts ? discounts : [];
		//update the actual price value
		this.price = this.price;
	}

	/**
	 * All the discounts that apply to the given item, but not the currentl user
	 *
	 * Example
	 *
	 * {
	 * 		amount: 5.00
	 * 		reason: Membership-Discount
	 * 		linkUrl: "/signup/",
	 * 		linkText: "Click here to signup"
	 * }
	 * 
	 * @param discounts
	 */
	@Input() set discountPossibilities(discounts: Discount[]) {
		this.nonEligibleDiscounts = discounts ? discounts : [];
	}

	ngOnInit() {
	}


	/**
	 *
	 * @param {number} basePrice
	 * @param {number} discountedPrice
	 * @returns {number}
	 */
	calculatePercentage(basePrice: number, discountedPrice: number): number {
		return 1 - discountedPrice / basePrice;
	}

	/**
	 *
	 */
	openDiscountOverlay() {
		this.matDialog.open(DiscountOverlayComponent, {
			data: {
				basePrice: this._basePrice,
				price: this.price,
				discounts: this.discounts
			}
		})
	}
}
