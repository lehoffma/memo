import {MerchColor} from "../../shop/shared/model/merch-color";

export interface ShoppingCartItem {
	id: number,
	amount: number,
	options?: {
		size?: string,
		color?: MerchColor,
	},
	// orderedItems: OrderedItem[]; //todo
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
