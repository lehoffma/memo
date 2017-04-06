import {ShoppingCartItem} from "./shopping-cart-item";
export interface ShoppingCartContent {
	merch: ShoppingCartItem[],
	partys: ShoppingCartItem[],
	tours: ShoppingCartItem[]
}
