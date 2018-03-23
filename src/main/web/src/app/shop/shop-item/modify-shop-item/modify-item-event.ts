import {ShopItem} from "../../../shared/model/shop-item";
import {ImageToUpload} from "../../../shared/multi-image-upload/multi-image-upload.component";
import {MerchStock} from "../../shared/model/merch-stock";

export interface ModifyItemEvent {
	item: ShopItem,
	images: { imagePaths: string[], imagesToUpload: ImageToUpload[] },
	stock?: MerchStock[];
}

