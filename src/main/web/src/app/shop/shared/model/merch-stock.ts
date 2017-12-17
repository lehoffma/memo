import {MerchColor} from "./merch-color";
import {Event} from "./event";

export type MerchStockList = MerchStock[];

export type MerchStock = {
	id: number;
	size: string,
	event: Event,
	color: MerchColor,
	amount: number
	//todo: sizetable objekt
}
