import {Route, RouterModule} from "@angular/router";
import {MemberListComponent} from "./member-list/member-list.component";
import {AuthenticatedGuard} from "../shared/authentication/authenticated.guard";
import {NgModule} from "@angular/core";
import {MilesLeaderboardComponent} from "./miles-leaderboard/miles-leaderboard.component";
import {UserMapContainerComponent} from "./user-map/user-map-container.component";
import {IsMemberGuard} from "../shared/authentication/is-member.guard";
import {IsBoardMemberGuard} from "../shared/authentication/is-board-member.guard";
import {ImpressumComponent} from "./impressum/impressum.component";

const routes: Route[] = [
	{path: "club", redirectTo: "club/calendar", pathMatch: "full"},
	{path: "club/map", component: UserMapContainerComponent, canActivate: [AuthenticatedGuard, IsMemberGuard]},
	{path: "club/leaderboard", component: MilesLeaderboardComponent, canActivate: [AuthenticatedGuard, IsMemberGuard]},
	{path: "club/members", component: MemberListComponent, canActivate: [AuthenticatedGuard, IsBoardMemberGuard]},
	{path: "club/impressum", component: ImpressumComponent},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ClubRoutingModule {
}
