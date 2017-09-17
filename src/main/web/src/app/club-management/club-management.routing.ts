
import {Route, RouterModule} from "@angular/router";
import {MemberListComponent} from "./administration/member-list/member-list.component";
import {MerchStockComponent} from "./administration/stock/merch-stock/merch-stock.component";
import {AccountingComponent} from "./accounting/accounting.component";
import {AuthenticatedGuard} from "../shared/authentication/authenticated.guard";
import {IsTreasurerGuard} from "../shared/authentication/is-treasurer.guard";
import {CanViewStockGuard} from "../shared/authentication/can-view-stock.guard";
import {NgModule} from "@angular/core";
import {DashboardComponent} from "./dashboard/dashboard.component";
import {MilesLeaderboardComponent} from "./miles-leaderboard/miles-leaderboard.component";

const routes: Route[] = [
	{path: "dashboard", component: DashboardComponent},
	{path: "leaderboard", component: MilesLeaderboardComponent},
	{path: "members", component: MemberListComponent},
	//nur eingeloggte user, die Kassenwart oder Admin sind, können diese Routen sehen
	{path: "management/costs", component: AccountingComponent, canActivate: [AuthenticatedGuard, IsTreasurerGuard]},

	{
		path: ":itemType/:eventId/costs",
		component: AccountingComponent,
		canActivate: [/*todo is-event guard*/ IsTreasurerGuard]
	},

	//todo update once there is more than one type of stock
	{path: "management/stock", redirectTo: "management/stock/merch", pathMatch: "full"},
	{
		path: "management/stock/merch",
		component: MerchStockComponent,
		//todo wieder rein hauen, demo
		// canActivate: [AuthenticatedGuard, CanViewStockGuard]
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ClubManagementRoutingModule{}


export const routedComponents = [
	MemberListComponent,
	AccountingComponent,
	MerchStockComponent,
	DashboardComponent,
	MilesLeaderboardComponent
];