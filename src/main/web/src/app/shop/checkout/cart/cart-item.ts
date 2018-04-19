import {Merchandise} from "../../shared/model/merchandise";
import {Tour} from "../../shared/model/tour";
import {Party} from "../../shared/model/party";
import {MerchColor} from "../../shared/model/merch-color";

export interface CartItem {
	item: Merchandise | Tour | Party;
	amount: number;
	options?: {
		color?: MerchColor;
		size?: string;
	}
}
