import {BaseObject} from "./util/base-object";
import {PaymentMethod} from "../../shop/checkout/payment/payment-method";
import {OrderedItem} from "./ordered-item";
import * as moment from "moment";
import {Moment} from "moment";

export class Order extends BaseObject<Order> {
	constructor(public readonly id: number,
				public readonly user: number,
				public readonly timeStamp: Moment,
				public method: PaymentMethod,
				public readonly items: OrderedItem[],
				public text: string,
				public bankAccount?: number) {
		super(id);
	}


	static create(): Order {
		return new Order(-1, -1, moment(), PaymentMethod.CASH, [], "");
	}

	static isOrder(object: any): object is Order {
		return object && (<Order>object).method !== undefined && (<Order>object).method !== null;
	}
}
