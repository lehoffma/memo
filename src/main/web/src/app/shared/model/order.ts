import {BaseObject} from "./util/base-object";
import {PaymentMethod} from "../../shop/checkout/payment/payment-method";
import {OrderedItem} from "./ordered-item";
import {Moment} from "moment";
import * as moment from "moment";

export class Order extends BaseObject<Order> {
	constructor(public readonly id: number,
				public readonly userId: number,
				public readonly timeStamp: Moment,
				public method: PaymentMethod,
				public readonly orderedItems: OrderedItem[],
				public bankAccount?: number) {
		super(id);
	}


	static create(): Order {
		return new Order(-1, -1, moment(), PaymentMethod.CASH, []);
	}

	static isOrder(object:any):object is Order{
		return object && (<Order>object).method !== undefined && (<Order>object).method !== null;
	}
}
