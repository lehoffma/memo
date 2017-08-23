import {BaseObject} from "./util/base-object";
import {PaymentMethod} from "../../shop/checkout/payment/payment-method";
import {ShoppingCartItem} from "./shopping-cart-item";
import {OrderedItem} from "./ordered-item";

export class Order extends BaseObject<Order> {
	constructor(public readonly id: number,
				public readonly userId: number,
				public readonly timeStamp: Date,
				//todo link to bank account
				public readonly payment: {
					method: PaymentMethod,
					bankAccount?: number
				},
				//todo something else? using the ID to fetch the item data might be buggy if the price changes in the future
				public readonly orderedItems: OrderedItem[]) {
		super(id);
	}


	static create(): Order {
		return new Order(-1, -1, null, {method: PaymentMethod.CASH}, []);
	}
}
