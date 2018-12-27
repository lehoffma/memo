import {MerchColor} from "./merch-color";

export interface WaitingListEntry {
	id: number;
	amount: number;
	user: number;
	shopItem: number;
	size?: string;
	color?: MerchColor;
}
