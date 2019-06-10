import {Merchandise} from "../../../../shop/shared/model/merchandise";
import {MerchStock} from "../../../../shop/shared/model/merch-stock";

export enum StockStatus {
	NO_PROBLEM = "Alles in Ordnung",
	WARNING = "Wird langsam knapp",
	OUT_OF_STOCK = "Ausverkauft"
}

export interface StockListEntry extends MerchStock {
	status: StockStatus
}

export interface StockEntry {
	stock: StockListEntry[],
	item: Merchandise
}

//if the status function gets any more complicated than this simple switch, we should definitely compute that server-side
export function stockAmountToStatus(amount: number): StockStatus {
	if (amount <= 0) {
		return StockStatus.OUT_OF_STOCK;
	}
	if (amount < 5) {
		return StockStatus.WARNING;
	}
	return StockStatus.NO_PROBLEM;
}
