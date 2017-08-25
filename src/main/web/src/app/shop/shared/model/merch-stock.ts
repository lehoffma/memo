import {MerchColor} from "./merch-color";

export type MerchStockList = MerchStock[];

export type MerchStock = {
	id: number;
	size: string,
	color: MerchColor,
	amount: number
}
