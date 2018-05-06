import {NgModule} from "@angular/core";
import {ClubManagementRoutingModule, routedComponents} from "./club-management.routing";
import {AccountingOptionsComponent} from "./accounting/accounting-options/accounting-options.component";
import {EntryCategoryCellComponent} from "./accounting/accounting-table-cells/entry-category-cell.component";
import {CostValueTableCellComponent} from "./accounting/accounting-table-cells/cost-value-table-cell.component";
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

const tableCellComponents = [
	//accounting table cells
	EntryCategoryCellComponent,
	CostValueTableCellComponent,

	//merch table cell
	MerchStockTableCellComponent,

];


@NgModule({
	imports: [
		FormsModule,
		ReactiveFormsModule,
		CommonModule,
		MemoMaterialModule,
		SharedModule,
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
	],
	providers: [
		SearchFilterService
	],
	entryComponents: [tableCellComponents]
})
export class ClubManagementModule {
}
