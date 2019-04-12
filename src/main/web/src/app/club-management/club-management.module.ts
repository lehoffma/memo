import {NgModule} from "@angular/core";
import {ClubManagementRoutingModule, routedComponents} from "./club-management.routing";
import {CommonModule} from "@angular/common";
import {SharedModule} from "../shared/shared.module";
import {MemoMaterialModule} from "../../material.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MerchStockTableCellComponent} from "./administration/stock/merch-stock/merch-stock-table-cell.component";
import {MerchStockFeedComponent} from "./administration/stock/merch-stock/merch-stock-feed/merch-stock-feed.component";
import {MerchStockEntryComponent} from "app/club-management/administration/stock/merch-stock/merch-stock-entry/merch-stock-entry.component";
import {MilesLeaderboardEntryComponent} from "app/club-management/miles-leaderboard/miles-leaderboard-entry.component";
import {ModifyShopItemModule} from "../shop/shop-item/modify-shop-item/modify-shop-item.module";
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
import {SharedSearchModule} from "../shared/search/shared-search.module";
import {PieChartModule} from "@swimlane/ngx-charts";
import { EntryRendererComponent } from './accounting/entry-renderer/entry-renderer.component';
import { MerchStockContainerComponent } from './administration/stock/merch-stock/merch-stock-container/merch-stock-container.component';

const tableCellComponents = [

	//merch table cell
	MerchStockTableCellComponent,

];


//todo lazy loading for this module (logged out/not vorstand users can't do anything here anyway)
@NgModule({
	imports: [
		FormsModule,
		ReactiveFormsModule,
		CommonModule,
		MemoMaterialModule,
		SharedModule,
		AgmCoreModule,
		PieChartModule,
		SharedSearchModule,
		UserModule,
		ShopItemDetailsModule,
		ModifyShopItemModule,
		ClubManagementRoutingModule,
	],
	declarations: [
		routedComponents,
		tableCellComponents,
		MerchStockFeedComponent,
		MerchStockEntryComponent,
		MilesLeaderboardEntryComponent,
		UserMapComponent,
		UserMapContainerComponent,
		AccountingOverviewComponent,
		AccountingNumberCardComponent,
		AccountingTimeSummaryComponent,
		AccountingItemSummaryComponent,
		CostPreviewComponent,
		EntryRendererComponent,
		MerchStockContainerComponent,
	],
	entryComponents: [tableCellComponents]
})
export class ClubManagementModule {
}
