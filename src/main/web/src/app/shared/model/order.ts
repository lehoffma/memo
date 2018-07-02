import {BaseObject} from "./util/base-object";
import {PaymentMethod} from "../../shop/checkout/payment/payment-method";
import {OrderedItem} from "./ordered-item";

export interface Order extends BaseObject {
	readonly user: number;
	readonly timeStamp: Date;
	method: PaymentMethod;
	readonly items: OrderedItem[];
	text: string;
	bankAccount?: number;
}


export function createOrder(): Order {
	return {
		id: -1,
		user: -1,
		timeStamp: new Date(),
		method: PaymentMethod.CASH,
		items: [],
		text: ""
	}
}
