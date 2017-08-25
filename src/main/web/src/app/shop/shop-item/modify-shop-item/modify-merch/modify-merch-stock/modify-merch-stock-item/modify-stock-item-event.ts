import {ModifyType} from "../../../modify-type";
import {MerchStock} from "../../../../../shared/model/merch-stock";

export interface ModifyStockItemEvent {
	size: string;
	color: { hex: string, name: string };
	amount: number;
	modifyType: ModifyType;
	modifiedStock: MerchStock;
}
