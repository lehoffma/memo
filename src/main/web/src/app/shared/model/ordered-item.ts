import {MerchColor} from "../../shop/shared/model/merch-color";
import {OrderStatus} from "./order-status";
import {Event} from "../../shop/shared/model/event";
import {Discount} from "../renderers/price-renderer/discount";

export interface OrderedItem {
	id: number,
	name?: string;
	item: Event,
	description: string,
	price: number,
	status: OrderStatus,
	discounts?: Discount[];
	size?: string,
	color?: MerchColor,
	isDriver?: boolean;
	needsTicket?: boolean;
}
