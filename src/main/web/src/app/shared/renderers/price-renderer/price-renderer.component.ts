import {Component, Input, OnInit} from "@angular/core";
import {Discount} from "./discount";
import {MatDialog} from "@angular/material";
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
	 * 		reason: "Membership-Discount"
	 * 		eligible: true (i.e. the logged in user is a member)
	 * },
	 * {
	 * 		amount: 5.00
	 * 		reason: Membership-Discount
	 * 		eligible: false (i.e. visitor is not logged in or the logged in user is not a member),
	 * 		link: {
	 * 			url: /signup/ (alternatively: /applyForMembership/)
	 * 			text: "Click here to signup" (alternatively: "Apply for membership")
	 * 		}
	 * }
	 * Another Example:
	 *        amount: 10.00
	 *        reason: Summer Sale
	 *        eligible: true
	 * @param {Discount[]} discounts
	 */
	@Input() set discounts(discounts: Discount[]) {
		let discountsCopy = discounts ? discounts : [];
		this._discounts = discountsCopy;
		//update the actual price value
		this.price = this.price;
		this.nonEligibleDiscounts = discountsCopy
			.filter(discount => !discount.eligible && discount.showLink);
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
