import {MerchColor} from "./merch-color";

export interface WaitingListEntry {
	id: number;
	user: number;
	shopItem: number;
	size?: string;
	color?: MerchColor;
	isDriver?: boolean;
	needsTicket?: boolean;
}
