import {ModifyType} from "../../../modify-type";
import {MerchStock} from "../../../../../shared/model/merch-stock";
import {Event} from "../../../../../shared/model/event";
import {MerchColor} from "../../../../../shared/model/merch-color";

export interface ModifyStockItemEvent {
	color: MerchColor;
	sizes: {
		[size: string]: number
	};
	event: Event,
	modifyType: ModifyType;
	modifiedStock: MerchStock;
}
