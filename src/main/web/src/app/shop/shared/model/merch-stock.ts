import {MerchColor} from "./merch-color";

export type MerchStock = {
	size: string,
	color: MerchColor,
	amount: number
}[];
