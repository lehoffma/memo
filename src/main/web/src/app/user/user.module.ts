import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {routedComponents, UserRoutingModule} from "./user.routing";
import {MyToursEntryComponent} from "./my-tours/entry/my-tours-entry.component";
import {ParticipatedToursPreviewComponent} from "./profile/participated-tours-preview/participated-tours-preview.component";
import {SignUpModule} from "./signup/signup.module";
import {SharedModule} from "../shared/shared.module";
import {MemoMaterialModule} from "../../material.module";
import {AgmCoreModule} from "@agm/core";
import {SearchModule} from "../shop/search-results/search.module";
import {ConfirmEmailComponent} from "./confirm-email/confirm-email.component";

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		SharedModule,
		SearchModule,
		MemoMaterialModule,
		AgmCoreModule,
		UserRoutingModule,
		SignUpModule
	],
	declarations: [
		routedComponents,

		MyToursEntryComponent,

		ParticipatedToursPreviewComponent,

		ConfirmEmailComponent,
	],
	exports: [
		SignUpModule
	]
})
export class UserModule {
}
