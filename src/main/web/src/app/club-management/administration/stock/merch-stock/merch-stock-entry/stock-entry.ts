import {Merchandise} from "../../../../../shop/shared/model/merchandise";
import {StockMap} from "../../../../../shared/services/api/stock.service";
import {MerchColor} from "../../../../../shop/shared/model/merch-color";

export interface StockEntry {
	stockMap: StockMap,
	options: { size: string[], color: MerchColor[] },
	item: Merchandise
}
