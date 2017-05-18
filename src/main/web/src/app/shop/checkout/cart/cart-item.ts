import {Merchandise} from "../../shared/model/merchandise";
import {Tour} from "../../shared/model/tour";
import {Party} from "../../shared/model/party";
export interface CartItem {
	item: Merchandise | Tour | Party;
	amount: number;
	options?: {
		color?: string;
		size?: string;
	}
}
