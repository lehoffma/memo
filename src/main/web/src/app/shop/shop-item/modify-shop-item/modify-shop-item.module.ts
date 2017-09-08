import {NgModule} from '@angular/core';
import {ModifyShopItemRoutingModule, routedComponents} from "./modify-shop-item.routing";
import {ModifyEntryComponent} from "./modify-entry/modify-entry.component";
import {ModifyMerchComponent} from "./modify-merch/modify-merch.component";
import {ModifyPartyComponent} from "./modify-party/modify-party.component";
import {ModifyTourComponent} from "./modify-tour/modify-tour.component";
import {ModifyUserComponent} from "./modify-user/modify-user.component";
import {TourRouteInputComponent} from "./tour-route-input/tour-route-input.component";
import {ModifyMerchStockComponent} from "./modify-merch/modify-merch-stock/modify-merch-stock.component";
import {ModifyMerchStockItemComponent} from "./modify-merch/modify-merch-stock/modify-merch-stock-item/modify-merch-stock-item.component";
import {MerchColorCellComponent} from "./modify-merch/modify-merch-stock/merch-color-cell.component";
import {ModifyItemService} from "./modify-item.service";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {UserModule} from "../../../user/user.module";
import {MemoMaterialModule} from "../../../../material.module";
import {SharedModule} from "../../../shared/shared.module";
import {ColorPickerModule} from "ngx-color-picker";
import {AgmCoreModule} from "@agm/core";


@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		ColorPickerModule,
		AgmCoreModule,
		MemoMaterialModule,
		SharedModule,
		UserModule,
		ModifyShopItemRoutingModule
	],
	exports: [],
	declarations: [
		routedComponents,
		ModifyEntryComponent,
		ModifyMerchComponent,
		ModifyMerchStockComponent,
		ModifyMerchStockItemComponent,
		MerchColorCellComponent,
		ModifyPartyComponent,
		ModifyTourComponent,
		ModifyUserComponent,
		TourRouteInputComponent
	],
	providers: [ModifyItemService],
	entryComponents: [
		ModifyMerchStockItemComponent,
		MerchColorCellComponent
	]
})
export class ModifyShopItemModule {
}
