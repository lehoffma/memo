import {MerchColor} from "./merch-color";

export type MerchStockList = MerchStock[];

export type MerchStock = {
	size: string,
	color: MerchColor,
	amount: number
}
