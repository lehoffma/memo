import {ShoppingCartItem} from "./shopping-cart-item";
import {EventData} from "./event-data";

export type ShoppingCartContent = {
	[P in keyof EventData]: ShoppingCartItem[];
};
