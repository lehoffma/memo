import {Route, RouterModule} from "@angular/router";
import {MemberListComponent} from "./administration/member-list/member-list.component";
import {MerchStockComponent} from "./administration/stock/merch-stock/merch-stock.component";
import {AccountingComponent} from "./accounting/accounting-details/accounting.component";
import {AuthenticatedGuard} from "../shared/authentication/authenticated.guard";
import {IsTreasurerGuard} from "../shared/authentication/is-treasurer.guard";
import {NgModule} from "@angular/core";
import {DashboardComponent} from "./dashboard/dashboard.component";
import {MilesLeaderboardComponent} from "./miles-leaderboard/miles-leaderboard.component";
import {CanViewStockGuard} from "../shared/authentication/can-view-stock.guard";
import {OrderOverviewComponent} from "./order-overview/order-overview.component";
import {UserMapContainerComponent} from "./user-map/user-map-container.component";
import {IsMemberGuard} from "../shared/authentication/is-member.guard";
import {IsBoardMemberGuard} from "../shared/authentication/is-board-member.guard";
import {AccountingOverviewComponent} from "./accounting/accounting-overview/accounting-overview.component";
import {AccountingTimeSummaryComponent} from "./accounting/accounting-overview/accounting-time-summary/accounting-time-summary.component";
import {AccountingItemSummaryComponent} from "./accounting/accounting-overview/accounting-item-summary/accounting-item-summary.component";
import {IsMerchandiseGuard} from "../shared/authentication/is-merchandise.guard";
import {ShopItemExistsGuard} from "../shared/authentication/http-error-handling-guards/shop-item-exists.guard";
import {ShopItemIsVisibleToUserGuard} from "../shared/authentication/http-error-handling-guards/shop-item-is-visible-to-user.guard";
import {MerchStockContainerComponent} from "./administration/stock/merch-stock/merch-stock-container/merch-stock-container.component";

const routes: Route[] = [
	{path: "club/dashboard", component: DashboardComponent, canActivate: [AuthenticatedGuard, IsMemberGuard]},
	{path: "club/map", component: UserMapContainerComponent, canActivate: [AuthenticatedGuard, IsMemberGuard]},
	{path: "club/leaderboard", component: MilesLeaderboardComponent, canActivate: [AuthenticatedGuard, IsMemberGuard]},
	{path: "club/members", component: MemberListComponent, canActivate: [AuthenticatedGuard, IsBoardMemberGuard]},
	//nur eingeloggte user, die Kassenwart oder Admin sind, können diese Routen sehen
	{path: "management", redirectTo: "management/dashboard", pathMatch: "full", canActivate: [AuthenticatedGuard]},
	{path: "management/orders", component: OrderOverviewComponent, canActivate: [AuthenticatedGuard]},
	{path: "management/costs", component: AccountingComponent, canActivate: [AuthenticatedGuard, IsTreasurerGuard]},
	{path: "management/costs-overview", component: AccountingOverviewComponent, canActivate: [AuthenticatedGuard, IsTreasurerGuard]},
	{path: "management/costs/items", component: AccountingItemSummaryComponent, canActivate: [AuthenticatedGuard, IsTreasurerGuard]},
	{path: "management/costs/time", component: AccountingTimeSummaryComponent, canActivate: [AuthenticatedGuard, IsTreasurerGuard]},

	{
		path: "shop/:itemType/:eventId/costs",
		redirectTo: "management/costs?eventId=:eventId",
		pathMatch: "full"
	},

	{path: "management/stock", redirectTo: "management/stock/merch", pathMatch: "full"},
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
	MemberListComponent,
	AccountingComponent,
	MerchStockComponent,
	DashboardComponent,
	MilesLeaderboardComponent,
	OrderOverviewComponent
];
