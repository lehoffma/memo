import {MerchColor} from "../../shop/shared/model/merch-color";
import {OrderStatus} from "./order-status";
import {Event} from "../../shop/shared/model/event";

export interface OrderedItem {
	id: number,
	item: Event,
	price: number,
	status: OrderStatus,
	size?: string,
	color?: MerchColor,
	isDriver?: boolean;
	needsTicket?: boolean;
}
