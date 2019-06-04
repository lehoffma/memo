import {NgModule} from "@angular/core";
import {ClubManagementRoutingModule, routedComponents} from "./club-management.routing";
import {CommonModule} from "@angular/common";
import {SharedModule} from "../shared/shared.module";
import {MemoMaterialModule} from "../../material.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MerchStockTableCellComponent} from "./stock/merch-stock/merch-stock-table-cell.component";
import {MerchStockFeedComponent} from "./stock/merch-stock/merch-stock-feed/merch-stock-feed.component";
import {MerchStockEntryComponent} from "app/club-management/stock/merch-stock/merch-stock-entry/merch-stock-entry.component";
import {MilesLeaderboardEntryComponent} from "app/club/miles-leaderboard/miles-leaderboard-entry.component";
import {ModifyShopItemModule} from "../shop/shop-item/modify-shop-item/modify-shop-item.module";
import {UserModule} from "../user/user.module";
import {ShopItemDetailsModule} from "../shop/shop-item/item-details/shop-item-details.module";
import {UserMapComponent} from "../club/user-map/user-map.component";
import {AgmCoreModule} from "@agm/core";
import {UserMapContainerComponent} from "../club/user-map/user-map-container.component";
import {AccountingOverviewComponent} from "./accounting/accounting-overview/accounting-overview.component";
import {NumberCardComponent} from "./shared/number-card/number-card.component";
import {AccountingTimeSummaryComponent} from "./accounting/accounting-overview/accounting-time-summary/accounting-time-summary.component";
import {AccountingItemSummaryComponent} from "./accounting/accounting-overview/accounting-item-summary/accounting-item-summary.component";
import {CostPreviewComponent} from "./accounting/accounting-overview/shared/cost-preview/cost-preview.component";
import {SharedSearchModule} from "../shared/search/shared-search.module";
import {AreaChartModule, LineChartModule, PieChartModule} from "@swimlane/ngx-charts";
import { EntryRendererComponent } from './accounting/entry-renderer/entry-renderer.component';
import { MerchStockContainerComponent } from './stock/merch-stock/merch-stock-container/merch-stock-container.component';
import {FlexLayoutModule} from "@angular/flex-layout";
import { OrderOverviewComponent } from './orders/order-overview.component';
import { StockOverviewComponent } from './stock/stock-overview.component';
import { DashboardContainerComponent } from './shared/dashboard-container/dashboard-container.component';
import { OrdersOverTimeChartComponent } from './orders/orders-over-time-chart/orders-over-time-chart.component';
import { PopularItemsComponent } from './orders/popular-items/popular-items.component';
import { PopularColorsComponent } from './orders/popular-colors/popular-colors.component';
import { PopularSizesComponent } from './orders/popular-sizes/popular-sizes.component';
import { LatestOrdersComponent } from './orders/latest-orders/latest-orders.component';
import { TrendRowComponent } from './orders/trend-row/trend-row.component';
import {DataContainerModule} from "../shared/utility/data-container/data-container.module";

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
		FlexLayoutModule,
		LineChartModule,
		AreaChartModule,
		DataContainerModule,
	],
	declarations: [
		routedComponents,
		tableCellComponents,
		MerchStockFeedComponent,
		MerchStockEntryComponent,
		AccountingOverviewComponent,
		NumberCardComponent,
		AccountingTimeSummaryComponent,
		AccountingItemSummaryComponent,
		CostPreviewComponent,
		EntryRendererComponent,
		MerchStockContainerComponent,
		OrderOverviewComponent,
		StockOverviewComponent,
		DashboardContainerComponent,
		OrdersOverTimeChartComponent,
		PopularItemsComponent,
		PopularColorsComponent,
		PopularSizesComponent,
		LatestOrdersComponent,
		TrendRowComponent,
	],
	entryComponents: [tableCellComponents]
})
export class ClubManagementModule {
}
