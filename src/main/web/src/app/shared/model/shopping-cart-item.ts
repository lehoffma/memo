import {MerchColor} from "../../shop/shared/model/merch-color";
import {Event} from "../../shop/shared/model/event";


export interface ShoppingCartOption {
	size?: string,
	color?: MerchColor,
	isDriver?: boolean;
	needsTicket?: boolean;
}

export interface ShoppingCartItem {
	id: number;
	item: Event,
	amount: number;
	options?: ShoppingCartOption[]
}

// export interface OrderedItem {
// 	id: number,
// 	item: Event,
// 	price: number,
// 	status: OrderStatus,
// 	size?: string,
// 	color?: MerchColor,
// 	isDriver?: boolean;
// 	needsTicket?: boolean;
// }
