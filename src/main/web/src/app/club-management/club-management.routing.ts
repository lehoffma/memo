import {Route, RouterModule} from "@angular/router";
import {MerchStockComponent} from "./stock/merch-stock/merch-stock.component";
import {AccountingComponent} from "./accounting/accounting-details/accounting.component";
import {AuthenticatedGuard} from "../shared/authentication/authenticated.guard";
import {IsTreasurerGuard} from "../shared/authentication/is-treasurer.guard";
import {NgModule} from "@angular/core";
import {DashboardComponent} from "./dashboard/dashboard.component";
import {CanViewStockGuard} from "../shared/authentication/can-view-stock.guard";
import {OrderManagementComponent} from "./orders/order-management.component";
import {IsMemberGuard} from "../shared/authentication/is-member.guard";
import {AccountingOverviewComponent} from "./accounting/accounting-overview/accounting-overview.component";
import {AccountingTimeSummaryComponent} from "./accounting/accounting-overview/accounting-time-summary/accounting-time-summary.component";
import {AccountingItemSummaryComponent} from "./accounting/accounting-overview/accounting-item-summary/accounting-item-summary.component";
import {IsMerchandiseGuard} from "../shared/authentication/is-merchandise.guard";
import {ShopItemExistsGuard} from "../shared/authentication/http-error-handling-guards/shop-item-exists.guard";
import {ShopItemIsVisibleToUserGuard} from "../shared/authentication/http-error-handling-guards/shop-item-is-visible-to-user.guard";
import {MerchStockContainerComponent} from "./stock/merch-stock/merch-stock-container/merch-stock-container.component";
import {OrderOverviewComponent} from "./orders/order-overview.component";
import {StockOverviewComponent} from "./stock/stock-overview.component";
import {DiscountsComponent} from "./discounts/discounts.component";
import {DiscountFormComponent} from "./discounts/discount-form/discount-form.component";

const routes: Route[] = [
	//nur eingeloggte user, die Kassenwart oder Admin sind, können diese Routen sehen
	{path: "management", redirectTo: "management/dashboard", pathMatch: "full", canActivate: [AuthenticatedGuard]},
	{path: "management/dashboard", component: DashboardComponent, canActivate: [AuthenticatedGuard, IsMemberGuard]},
	{path: "management/discounts", component: DiscountsComponent, canActivate: [AuthenticatedGuard, IsTreasurerGuard]},
	{path: "management/discounts/form", component: DiscountFormComponent, canActivate: [AuthenticatedGuard, IsTreasurerGuard]},
	{path: "management/discounts/edit/:id", component: DiscountFormComponent, canActivate: [AuthenticatedGuard, IsTreasurerGuard]},
	{path: "management/orders-overview", component: OrderOverviewComponent, canActivate: [AuthenticatedGuard]},
	{path: "management/orders", component: OrderManagementComponent, canActivate: [AuthenticatedGuard]},
	{path: "management/costs", component: AccountingComponent, canActivate: [AuthenticatedGuard, IsTreasurerGuard]},
	{path: "management/costs-overview", component: AccountingOverviewComponent, canActivate: [AuthenticatedGuard, IsTreasurerGuard]},
	{path: "management/costs/items", component: AccountingItemSummaryComponent, canActivate: [AuthenticatedGuard, IsTreasurerGuard]},
	{path: "management/costs/time", component: AccountingTimeSummaryComponent, canActivate: [AuthenticatedGuard, IsTreasurerGuard]},

	{path: "management/stock-overview", component: StockOverviewComponent, canActivate: [AuthenticatedGuard, CanViewStockGuard]},
	{path: "management/stock", redirectTo: "management/stock-overview", pathMatch: "full"},
	{
		path: "management/stock/merch",
		component: MerchStockComponent,
		canActivate: [AuthenticatedGuard, CanViewStockGuard]
	},

	{
		path: "management/stock/:itemType/:id", component: MerchStockContainerComponent,
		pathMatch: "full",
		canActivate: [AuthenticatedGuard, CanViewStockGuard, IsMerchandiseGuard,
			ShopItemExistsGuard, ShopItemIsVisibleToUserGuard]
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ClubManagementRoutingModule {
}


export const routedComponents = [
	AccountingComponent,
	MerchStockComponent,
	DashboardComponent,
	OrderManagementComponent
];
