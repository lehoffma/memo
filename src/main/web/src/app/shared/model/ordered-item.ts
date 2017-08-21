import {MerchColor} from "../../shop/shared/model/merch-color";
import {OrderStatus} from "./order-status";

export interface OrderedItem {
	id: number,
	price: number,
	status: OrderStatus,
	amount: number,
	options?: {
		size?: string,
		color?: MerchColor,
	}
}
