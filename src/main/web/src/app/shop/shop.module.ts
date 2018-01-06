import {ModuleWithProviders, NgModule} from "@angular/core";
import {CheckoutModule} from "./checkout/checkout.module";
import {SearchModule} from "./search-results/search.module";
import {EventCalendarContainerModule} from "./event-calendar-container/event-calendar-container.module";
import {ModifyShopItemModule} from "./shop-item/modify-shop-item/modify-shop-item.module";
import {ShopItemDetailsModule} from "./shop-item/item-details/shop-item-details.module";
import {PriceRendererComponent} from '../shared/price-renderer/price-renderer.component';
import {DiscountService} from "./shared/services/discount.service";
import {CommonModule} from "@angular/common";
import {MemoMaterialModule} from "../../material.module";
import {RouterModule} from "@angular/router";
import {DiscountOverlayComponent} from '../shared/price-renderer/discount-overlay.component';

const providers = [
	DiscountService
];

@NgModule({
	imports: [
		CommonModule,
		MemoMaterialModule,
		RouterModule,
		CheckoutModule,
		SearchModule,
		EventCalendarContainerModule,
		ModifyShopItemModule,
		ShopItemDetailsModule
	],
	declarations: [
		DiscountOverlayComponent
	],
	providers: [
		...providers
	],
	exports: [
		CheckoutModule,
		SearchModule,
		EventCalendarContainerModule,
		ModifyShopItemModule,
		ShopItemDetailsModule,
	],
	entryComponents: [
		DiscountOverlayComponent
	]
})
export class ShopModule {
	static forRoot(): ModuleWithProviders {
		return {
			ngModule: ShopModule,
			providers: [...providers]
		};
	}
}
