import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {ParticipantListComponent} from "./participant-list.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MemoMaterialModule} from "../../../../../../material.module";
import {ShareButtonsModule} from "@ngx-share/buttons";
import {SharedModule} from "../../../../../shared/shared.module";
import {FlexLayoutModule} from "@angular/flex-layout";
import {WaitingListComponent} from "./waiting-list/waiting-list.component";
import {ParticipantsCategorySelectionComponent} from "./participants-category-selection/participants-category-selection.component";
import {RouterModule} from "@angular/router";
import {BatchModifyParticipantComponent} from "./batch-modify-participant/batch-modify-participant.component";

@NgModule({
	declarations: [
		ParticipantListComponent,
		WaitingListComponent,
		ParticipantsCategorySelectionComponent,
		BatchModifyParticipantComponent
	],
	imports: [
		CommonModule,
		FormsModule,
		RouterModule,
		ReactiveFormsModule,
		MemoMaterialModule,
		ShareButtonsModule,
		SharedModule,
		FlexLayoutModule,
	],
	exports: [
		ParticipantListComponent
	],
	entryComponents: [
		BatchModifyParticipantComponent,
	]
})
export class ParticipantsModule {
}
