import {ShopItem} from "../../../shared/model/shop-item";
import {MerchStock} from "../../shared/model/merch-stock";
import {ModifiedImages} from "./modified-images";


export interface ModifyItemEvent {
	item: ShopItem,
	images: ModifiedImages,
	stock?: MerchStock[];
}

