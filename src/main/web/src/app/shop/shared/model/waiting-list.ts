import {MerchColor} from "./merch-color";
import {User} from "../../../shared/model/user";

export interface WaitingListEntry {
	id: number;
	user: number;
	shopItem: number;
	name?: string;
	size?: string;
	color?: MerchColor;
	isDriver?: boolean;
	needsTicket?: boolean;
}

export interface WaitingListUser {
	id: number;
	user: User;
	shopItem: number;
	name?: string;
	size?: string;
	color?: MerchColor;
	isDriver?: boolean;
	needsTicket?: boolean;
}
