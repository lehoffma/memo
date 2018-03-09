import {MerchColor} from "./merch-color";
import {Event} from "./event";

export type MerchStockList = MerchStock[];

//todo
export type SizeTable = {
	id: number;
	name: string;
	min: number;
	max: number;
}

export type MerchStock = {
	id: number;
	size: string,
	item: Event,
	color: MerchColor,
	amount: number
	//todo: sizetable object
}
