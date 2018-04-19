import {ModifyType} from "../../../modify-type";
import {MerchStock} from "../../../../../shared/model/merch-stock";
import {Event} from "../../../../../shared/model/event";

export interface ModifyStockItemEvent {
	color: { hex: string, name: string };
	sizes: {
		[size: string]: number
	};
	event: Event,
	modifyType: ModifyType;
	modifiedStock: MerchStock;
}
