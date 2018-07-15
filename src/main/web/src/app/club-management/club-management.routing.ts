import {Route, RouterModule} from "@angular/router";
import {MemberListComponent} from "./administration/member-list/member-list.component";
import {MerchStockComponent} from "./administration/stock/merch-stock/merch-stock.component";
import {AccountingComponent} from "./accounting/accounting.component";
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

const routes: Route[] = [
	{path: "dashboard", component: DashboardComponent, canActivate: [AuthenticatedGuard, IsMemberGuard]},
	{path: "map", component: UserMapContainerComponent, canActivate: [AuthenticatedGuard, IsMemberGuard]},
	{path: "leaderboard", component: MilesLeaderboardComponent, canActivate: [AuthenticatedGuard, IsMemberGuard]},
	{path: "members", component: MemberListComponent, canActivate: [AuthenticatedGuard, IsBoardMemberGuard]},
	//nur eingeloggte user, die Kassenwart oder Admin sind, können diese Routen sehen
	{path: "management", redirectTo: "management/costs", pathMatch: "full", canActivate: [AuthenticatedGuard]},
	{path: "management/orders", component: OrderOverviewComponent, canActivate: [AuthenticatedGuard]},
	{path: "management/costs", component: AccountingComponent, canActivate: [AuthenticatedGuard, IsTreasurerGuard]},

	{
		path: ":itemType/:eventId/costs",
		redirectTo: "management/costs?eventId=:eventId",
		pathMatch: "full"
	},

	//todo update once there is more than one type of stock
	{path: "management/stock", redirectTo: "management/stock/merch", pathMatch: "full"},
	{
		path: "management/stock/merch",
		component: MerchStockComponent,
		canActivate: [AuthenticatedGuard, CanViewStockGuard]
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
