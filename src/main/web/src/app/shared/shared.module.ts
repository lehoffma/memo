import {NgModule} from "@angular/core";
import {MultiLevelSelectModule} from "./utility/multi-level-select/multi-level-select.module";
import {EventCalendarComponent} from "./utility/event-calendar/event-calendar.component";
import {CommonModule} from "@angular/common";
import {BadgeComponent} from "./utility/badge/badge.component";
import {PageNotFoundComponent} from "./utility/error-page/page-not-found.component";
import {AutoSizeTextAreaDirective} from "./autosize-textarea.directive";
import {ConfirmationDialogComponent} from "./utility/confirmation-dialog/confirmation-dialog.component";
import {MemoMaterialModule} from "../../material.module";
import {PriceRendererComponent} from "./renderers/price-renderer/price-renderer.component";
import {RouterModule} from "@angular/router";
import {ProfileLinkComponent} from "./renderers/profile-renderer/profile-link/profile-link.component";
import {ProfilePreviewComponent} from "./renderers/profile-renderer/profile-preview/profile-preview.component";
import {CapacityRendererComponent} from "./renderers/capacity-renderer/capacity-renderer.component";
import {ShareDialogComponent} from "./share-dialog/share-dialog.component";
import {UserAutocompleteComponent} from "./forms/autocomplete/user-autocomplete/user-autocomplete.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ShareButtonsModule} from "@ngx-share/buttons";
import {DisplayErrorDirective} from "./template-validators/display-error.directive";
import {UserPreviewDirective} from "./renderers/profile-renderer/user-preview.directive";
import {CalendarModule} from "angular-calendar";
import {DisableIfDirective} from "./forms/directives/disable-if.directive";
import {EmailInputComponent} from "./forms/email-input/email-input.component";
import {ClubInformationFormComponent} from "./forms/club-information/club-information-form.component";
import {PasswordInputComponent} from "./forms/password-input/password-input.component";
import {PersonalDataFormComponent} from "./forms/personal-data-form/personal-data-form.component";
import {AddressFormComponent} from "./forms/address-form/address-form.component";
import {AddressInputFormComponent} from "./forms/address-form/address-input-form.component";
import {AddressEntryComponent} from "./forms/address-form/address-entry.component";
import {BankAccountFormComponent} from "./forms/bank-account-form/bank-account-form.component";
import {BankAccountEntryComponent} from "./forms/bank-account-form/bank-account-entry.component";
import {BankAccountInputFormComponent} from "./forms/bank-account-form/bank-account-input-form.component";
import {EventAutocompleteComponent} from "./forms/autocomplete/event-autocomplete/event-autocomplete.component";
import {OrderedItemFormComponent} from "./forms/ordered-item-form/ordered-item-form.component";
import {OrderedItemInputFormComponent} from "./forms/ordered-item-form/ordered-item-input-form.component";
import {OrderedItemEntryComponent} from "./forms/ordered-item-form/ordered-item-entry.component";
import {OrderRendererComponent} from "./renderers/order-renderer/order-renderer.component";
import {MultiImageUploadComponent} from "./utility/multi-image-upload/multi-image-upload.component";
import {MultiImageContainerComponent} from "./utility/multi-image-container/multi-image-container.component";
import {ErrorPageComponent} from "./utility/error-page/error-page.component";
import {ExpandableMaterialTableModule} from "./utility/material-table/expandable-material-table.module";
import {SharedPipesModule} from "./pipes/shared-pipes.module";
import {ScrollSpyDirective} from "./utility/scroll-spy.directive";
import {SpiedOnElementDirective} from "./utility/spied-on-element.directive";
import {MatPasswordStrengthModule} from "@angular-material-extensions/password-strength";
import {LazyLoadingModule} from "./lazy-loading/lazy-loading.module";
import { BreadcrumbNavigationComponent } from './breadcrumb-navigation/breadcrumb-navigation.component';
import {JSONLdComponent} from "./utility/seo/json-ld.component";

const forms = [
	DisableIfDirective,
	EmailInputComponent,
	PasswordInputComponent,
	PersonalDataFormComponent,
	ClubInformationFormComponent,
	AddressFormComponent,
	AddressInputFormComponent,
	AddressEntryComponent,
	BankAccountFormComponent,
	BankAccountEntryComponent,
	BankAccountInputFormComponent,

	EventAutocompleteComponent,

	OrderedItemEntryComponent,
	OrderedItemFormComponent,
	OrderedItemInputFormComponent
];

@NgModule({
	imports: [
		CommonModule,
		RouterModule,
		FormsModule,
		ReactiveFormsModule,
		ShareButtonsModule,
		MatPasswordStrengthModule,
		ExpandableMaterialTableModule,
		MemoMaterialModule,
		MultiLevelSelectModule,
		CalendarModule,
		LazyLoadingModule,
		SharedPipesModule
	],
	declarations: [
		EventCalendarComponent,

		ConfirmationDialogComponent,

		BadgeComponent,
		PageNotFoundComponent,
		ErrorPageComponent,
		AutoSizeTextAreaDirective,
		MultiImageUploadComponent,
		MultiImageContainerComponent,
		PriceRendererComponent,

		ProfileLinkComponent,
		ProfilePreviewComponent,
		CapacityRendererComponent,
		ShareDialogComponent,
		UserAutocompleteComponent,
		DisplayErrorDirective,
		UserPreviewDirective,
		OrderRendererComponent,

		...forms,

		EventAutocompleteComponent,
		ScrollSpyDirective,
		SpiedOnElementDirective,
		BreadcrumbNavigationComponent,
		JSONLdComponent
	],
	exports: [
		MultiLevelSelectModule,
		ExpandableMaterialTableModule,
		SharedPipesModule,
		LazyLoadingModule,

		EventCalendarComponent,

		BadgeComponent,
		PageNotFoundComponent,
		ErrorPageComponent,

		AutoSizeTextAreaDirective,

		ShareDialogComponent,

		MultiImageUploadComponent,
		MultiImageContainerComponent,

		PriceRendererComponent,

		ProfileLinkComponent,

		CapacityRendererComponent,
		UserAutocompleteComponent,

		DisplayErrorDirective,

		UserPreviewDirective,
		OrderRendererComponent,
		ScrollSpyDirective,
		SpiedOnElementDirective,
		BreadcrumbNavigationComponent,
		JSONLdComponent,

		...forms
	],
	entryComponents: [
		ConfirmationDialogComponent,
		ProfilePreviewComponent,
		ShareDialogComponent
	]
})
export class SharedModule {
}
