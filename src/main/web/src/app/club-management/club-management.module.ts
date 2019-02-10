import {NgModule} from "@angular/core";
import {ClubManagementRoutingModule, routedComponents} from "./club-management.routing";
import {AccountingOptionsComponent} from "./accounting/accounting-details/accounting-options/accounting-options.component";
import {CommonModule} from "@angular/common";
import {SharedModule} from "../shared/shared.module";
import {MemoMaterialModule} from "../../material.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MerchStockTableCellComponent} from "./administration/stock/merch-stock/merch-stock-table-cell.component";
import {MerchStockFeedComponent} from "./administration/stock/merch-stock/merch-stock-feed/merch-stock-feed.component";
import {MerchStockEntryComponent} from "app/club-management/administration/stock/merch-stock/merch-stock-entry/merch-stock-entry.component";
import {SearchFilterService} from "../shop/search-results/search-filter.service";
import {SearchModule} from "../shop/search-results/search.module";
import {MilesLeaderboardEntryComponent} from "app/club-management/miles-leaderboard/miles-leaderboard-entry.component";
import {ModifyShopItemModule} from "../shop/shop-item/modify-shop-item/modify-shop-item.module";
import {OrderOptionsComponent} from "./order-overview/order-options.component";
import {UserModule} from "../user/user.module";
import {ShopItemDetailsModule} from "../shop/shop-item/item-details/shop-item-details.module";
import {UserMapComponent} from "./user-map/user-map.component";
import {AgmCoreModule} from "@agm/core";
import {UserMapContainerComponent} from "./user-map/user-map-container.component";
import {AccountingOverviewComponent} from "./accounting/accounting-overview/accounting-overview.component";
import {AccountingNumberCardComponent} from "./accounting/accounting-overview/accounting-number-card.component";
import {AccountingTimeSummaryComponent} from "./accounting/accounting-overview/accounting-time-summary/accounting-time-summary.component";
import {AccountingItemSummaryComponent} from "./accounting/accounting-overview/accounting-item-summary/accounting-item-summary.component";
import {CostPreviewComponent} from "./accounting/accounting-overview/shared/cost-preview/cost-preview.component";

const tableCellComponents = [

	//merch table cell
	MerchStockTableCellComponent,

];


//todo utilize lazy loading for this module (logged out/not vorstand users can't do anything here anyway)
@NgModule({
	imports: [
		FormsModule,
		ReactiveFormsModule,
		CommonModule,
		MemoMaterialModule,
		SharedModule,
		AgmCoreModule,
		SearchModule,
		UserModule,
		ShopItemDetailsModule,
		ModifyShopItemModule,
		ClubManagementRoutingModule
	],
	declarations: [
		routedComponents,
		AccountingOptionsComponent,
		tableCellComponents,
		MerchStockFeedComponent,
		MerchStockEntryComponent,
		MilesLeaderboardEntryComponent,
		OrderOptionsComponent,
		UserMapComponent,
		UserMapContainerComponent,
		AccountingOverviewComponent,
		AccountingNumberCardComponent,
		AccountingTimeSummaryComponent,
		AccountingItemSummaryComponent,
		CostPreviewComponent,
	],
	providers: [
		SearchFilterService
	],
	entryComponents: [tableCellComponents]
})
export class ClubManagementModule {
}
