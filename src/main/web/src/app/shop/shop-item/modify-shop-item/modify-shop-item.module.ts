import {NgModule} from "@angular/core";
import {ModifyShopItemRoutingModule, routedComponents} from "./modify-shop-item.routing";
import {ModifyEntryComponent} from "./modify-entry/modify-entry.component";
import {ModifyMerchComponent} from "./modify-merch/modify-merch.component";
import {ModifyPartyComponent} from "./modify-party/modify-party.component";
import {ModifyTourComponent} from "./modify-tour/modify-tour.component";
import {ModifyUserComponent} from "./modify-user/modify-user.component";
import {TourRouteInputComponent} from "./shared/tour-route-input/tour-route-input.component";
import {ModifyMerchStockComponent} from "./modify-merch/modify-merch-stock/modify-merch-stock.component";
import {ModifyMerchStockItemComponent} from "./modify-merch/modify-merch-stock/modify-merch-stock-item/modify-merch-stock-item.component";
import {ModifyItemService} from "./modify-item.service";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {UserModule} from "../../../user/user.module";
import {MemoMaterialModule} from "../../../../material.module";
import {SharedModule} from "../../../shared/shared.module";
import {ColorPickerModule} from "ngx-color-picker";
import {AgmCoreModule} from "@agm/core";
import {ModifyMerchStockContainerComponent} from "./modify-merch/modify-merch-stock-container/modify-merch-stock-container.component";
import {DirectionsMapDirective} from "./shared/tour-route-input/directions-map.directive";
import {ShopItemDetailsModule} from "../item-details/shop-item-details.module";
import {ItemPermissionsInputComponent} from "./shared/item-permissions-input/item-permissions-input.component";
import {SharedShopModule} from "../../shared/shop-shared.module";

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		ColorPickerModule,
		AgmCoreModule,
		MemoMaterialModule,
		SharedShopModule,
		SharedModule,
		ModifyShopItemRoutingModule,
		ShopItemDetailsModule,
		UserModule,
	],
	exports: [ModifyMerchStockComponent],
	declarations: [
		routedComponents,
		DirectionsMapDirective,
		ModifyEntryComponent,
		ModifyMerchComponent,
		ModifyMerchStockComponent,
		ModifyMerchStockItemComponent,
		ModifyPartyComponent,
		ModifyTourComponent,
		ModifyUserComponent,
		TourRouteInputComponent,
		ModifyMerchStockContainerComponent,
		ItemPermissionsInputComponent
	],
	providers: [ModifyItemService],
	entryComponents: [
		ModifyMerchStockItemComponent,
	],
})
export class ModifyShopItemModule {
}
