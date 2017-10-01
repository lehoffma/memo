import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {routedComponents, UserRoutingModule} from "./user.routing";
import {PasswordRecoveryComponent} from "./password-recovery/password-recovery.component";
import {OrderHistoryEntryComponent} from "./order-history/order-history-entry/order-history-entry.component";
import {MyToursEntryComponent} from "./my-tours/entry/my-tours-entry.component";
import {ParticipatedToursPreviewComponent} from "./profile/participated-tours-preview/participated-tours-preview.component";
import {SignUpModule} from "./signup/signup.module";
import {PasswordStrengthBarModule} from "ng2-password-strength-bar";
import {SharedModule} from "../shared/shared.module";
import {MemoMaterialModule} from "../../material.module";
import {AgmCoreModule} from "@agm/core";
import {SearchModule} from "../shop/search-results/search.module";

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		SharedModule,
		SearchModule,
		MemoMaterialModule,
		AgmCoreModule,
		PasswordStrengthBarModule,
		UserRoutingModule,
		SignUpModule
	],
	declarations: [
		routedComponents,
		PasswordRecoveryComponent,

		OrderHistoryEntryComponent,

		MyToursEntryComponent,

		ParticipatedToursPreviewComponent
	],
	exports: [
		SignUpModule
	]
})
export class UserModule {
}
