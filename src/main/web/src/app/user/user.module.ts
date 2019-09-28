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
import {ConfirmEmailComponent} from "./confirm-email/confirm-email.component";
import {BoldNotificationTextPipe} from "./notifications/bold-notification-text.pipe";
import {SafeHtmlPipe} from "./notifications/safe-html.pipe";
import {UserSettingsComponent} from "./user-settings/user-settings.component";
import {PersonalDataWrapperComponent} from "./user-settings/subsections/personal-data-wrapper/personal-data-wrapper.component";
import {ProfilePictureWrapperComponent} from "./user-settings/subsections/profile-picture-wrapper/profile-picture-wrapper.component";
import {AddressesWrapperComponent} from "./user-settings/subsections/addresses-wrapper/addresses-wrapper.component";
import {AccountDataWrapperComponent} from "./user-settings/subsections/account-data-wrapper/account-data-wrapper.component";
import {ClubInformationWrapperComponent} from "./user-settings/subsections/club-information-wrapper/club-information-wrapper.component";
import {NotificationSettingsComponent} from "./user-settings/subsections/notification-settings/notification-settings.component";
import {UserEventEmptyStateComponent} from "./user-event-empty-state/user-event-empty-state.component";
import {SharedSearchModule} from "../shared/search/shared-search.module";
import {FlexLayoutModule} from "@angular/flex-layout";
import {PaymentSettingsComponent} from "./user-settings/subsections/payment-settings/payment-settings.component";
import {DataContainerModule} from "../shared/utility/data-container/data-container.module";

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		SharedModule,
		SharedSearchModule,
		MemoMaterialModule,
		AgmCoreModule,
		UserRoutingModule,
		SignUpModule,
		FlexLayoutModule,
		DataContainerModule,
	],
	declarations: [
		routedComponents,

		MyToursEntryComponent,

		ParticipatedToursPreviewComponent,

		ConfirmEmailComponent,
		BoldNotificationTextPipe,
		SafeHtmlPipe,
		UserSettingsComponent,
		PersonalDataWrapperComponent,
		ProfilePictureWrapperComponent,
		AddressesWrapperComponent,
		AccountDataWrapperComponent,
		ClubInformationWrapperComponent,
		NotificationSettingsComponent,
		UserEventEmptyStateComponent,
		PaymentSettingsComponent
	],
	exports: [
		SignUpModule
	]
})
export class UserModule {
}
