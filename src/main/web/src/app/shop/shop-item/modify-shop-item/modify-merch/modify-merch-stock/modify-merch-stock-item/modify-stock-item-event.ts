import {ModifyType} from "../../../modify-type";
import {MerchStock} from "../../../../../shared/model/merch-stock";
import {Event} from "../../../../../shared/model/event";

export interface ModifyStockItemEvent {
	sizes: string[];
	color: { hex: string, name: string };
	amount: number;
	event: Event,
	modifyType: ModifyType;
	modifiedStock: MerchStock;
}
