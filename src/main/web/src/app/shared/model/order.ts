import {BaseObject} from "./util/base-object";
import {PaymentMethod} from "../../shop/checkout/payment/payment-method";
import {OrderedItem} from "./ordered-item";

export class Order extends BaseObject<Order> {
	constructor(public readonly id: number,
				public readonly userId: number,
				public readonly timeStamp: Date,
				public method: PaymentMethod,
				//todo link to bank account
				public readonly orderedItems: OrderedItem[],
				public bankAccount?: number) {
		super(id);
	}


	static create(): Order {
		return new Order(-1, -1, null, PaymentMethod.CASH, []);
	}
}
