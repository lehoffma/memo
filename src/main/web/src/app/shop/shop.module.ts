import {NgModule} from "@angular/core";
import {CheckoutModule} from "./checkout/checkout.module";
import {SearchModule} from "./search-results/search.module";
import {EventCalendarContainerModule} from "./event-calendar-container/event-calendar-container.module";
import {ModifyShopItemModule} from "./shop-item/modify-shop-item/modify-shop-item.module";
import {ShopItemDetailsModule} from "./shop-item/item-details/shop-item-details.module";

@NgModule({
	imports: [
		CheckoutModule,
		SearchModule,
		EventCalendarContainerModule,
		ModifyShopItemModule,
		ShopItemDetailsModule
	],
	declarations: [
	],
	exports: [
		CheckoutModule,
		SearchModule,
		EventCalendarContainerModule,
		ModifyShopItemModule,
		ShopItemDetailsModule
	]
})
export class ShopModule {

}
