import {MerchStockList} from "../../../../shop/shared/model/merch-stock";

export interface GroupedStockItem {
	event: Event,
	stockList: MerchStockList,
	amount: number
}
