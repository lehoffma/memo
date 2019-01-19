import {MerchColor} from "./merch-color";
import {User} from "../../../shared/model/user";

export interface WaitingListEntry {
	id: number;
	user: number;
	shopItem: number;
	size?: string;
	color?: MerchColor;
	isDriver?: boolean;
	needsTicket?: boolean;
}

export interface WaitingListUser {
	id: number;
	user: User;
	shopItem: number;
	size?: string;
	color?: MerchColor;
	isDriver?: boolean;
	needsTicket?: boolean;
}
