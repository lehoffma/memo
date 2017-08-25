import {MerchColor} from "../../shop/shared/model/merch-color";

export interface ShoppingCartItem {
	id: number,
	amount: number,
	options?: {
		size?: string,
		color?: MerchColor,
	}
}
