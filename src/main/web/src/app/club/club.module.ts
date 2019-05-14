import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {MilesLeaderboardComponent} from "./miles-leaderboard/miles-leaderboard.component";
import {MemberListComponent} from "./member-list/member-list.component";
import {UserMapContainerComponent} from "./user-map/user-map-container.component";
import {MilesLeaderboardEntryComponent} from "./miles-leaderboard/miles-leaderboard-entry.component";
import {UserMapComponent} from "./user-map/user-map.component";
import {MemoMaterialModule} from "../../material.module";
import {ReactiveFormsModule} from "@angular/forms";
import {ExpandableMaterialTableModule} from "../shared/utility/material-table/expandable-material-table.module";
import {ClubRoutingModule} from "./club.routing";
import {AgmCoreModule} from "@agm/core";
import {SharedModule} from "../shared/shared.module";

@NgModule({
	declarations: [
		MilesLeaderboardComponent,
		MemberListComponent,
		MilesLeaderboardEntryComponent,
		UserMapComponent,
		UserMapContainerComponent,
	],
	imports: [
		CommonModule,
		MemoMaterialModule,
		ReactiveFormsModule,
		ExpandableMaterialTableModule,
		ClubRoutingModule,
		AgmCoreModule,
		SharedModule,
	]
})
export class ClubModule {
}
