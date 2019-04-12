import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {ParticipantListComponent} from "./participant-list.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MemoMaterialModule} from "../../../../../../material.module";
import {ShareButtonsModule} from "@ngx-share/buttons";
import {SharedModule} from "../../../../../shared/shared.module";
import {FlexLayoutModule} from "@angular/flex-layout";
import {WaitingListComponent} from "./waiting-list/waiting-list.component";
import { ParticipantsCategorySelectionComponent } from './participants-category-selection/participants-category-selection.component';

@NgModule({
	declarations: [
		ParticipantListComponent,
		WaitingListComponent,
		ParticipantsCategorySelectionComponent
	],
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		MemoMaterialModule,
		ShareButtonsModule,
		SharedModule,
		FlexLayoutModule,
	],
	exports: [
		ParticipantListComponent
	]
})
export class ParticipantsModule {
}
