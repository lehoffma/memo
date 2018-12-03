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
import {RelativeTimeFormatPipe} from "./notifications/relative-time-format.pipe";
import {BoldNotificationTextPipe} from "./notifications/bold-notification-text.pipe";
import {SafeHtmlPipe} from "./notifications/safe-html.pipe";
import { UserSettingsComponent } from './user-settings/user-settings.component';

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
		RelativeTimeFormatPipe,
		BoldNotificationTextPipe,
		SafeHtmlPipe,
		UserSettingsComponent
	],
	exports: [
		SignUpModule
	]
})
export class UserModule {
}
