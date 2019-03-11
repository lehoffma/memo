import {NgModule} from "@angular/core";
import {MultiLevelSelectModule} from "./utility/multi-level-select/multi-level-select.module";
import {EventCalendarComponent} from "./utility/event-calendar/event-calendar.component";
import {CommonModule} from "@angular/common";
import {PageNotFoundComponent} from "./utility/error-page/page-not-found.component";
import {ConfirmationDialogComponent} from "./utility/confirmation-dialog/confirmation-dialog.component";
import {MemoMaterialModule} from "../../material.module";
import {PriceRendererComponent} from "./renderers/price-renderer/price-renderer.component";
import {RouterModule} from "@angular/router";
import {ProfileLinkComponent} from "./renderers/profile-renderer/profile-link/profile-link.component";
import {ProfilePreviewComponent} from "./renderers/profile-renderer/profile-preview/profile-preview.component";
import {CapacityRendererComponent} from "./renderers/capacity-renderer/capacity-renderer.component";
import {ShareDialogComponent} from "./share-dialog/share-dialog.component";
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
import {BreadcrumbNavigationComponent} from "./breadcrumb-navigation/breadcrumb-navigation.component";
import {JSONLdComponent} from "./utility/seo/json-ld.component";
import {EventDestinationRendererComponent} from "./renderers/event-destination-renderer/event-destination-renderer.component";
import {SharedSearchModule} from "./search/shared-search.module";
import {LetModule} from "./utility/let/let.module";
import {AutocompleteFormsModule} from "./forms/autocomplete/autocomplete-forms.module";

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

	OrderedItemEntryComponent,
	OrderedItemFormComponent,
	OrderedItemInputFormComponent,
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
		SharedPipesModule,
		SharedSearchModule,
		AutocompleteFormsModule,
		LetModule,
	],
	declarations: [
		EventCalendarComponent,

		ConfirmationDialogComponent,

		PageNotFoundComponent,
		ErrorPageComponent,
		MultiImageUploadComponent,
		MultiImageContainerComponent,
		PriceRendererComponent,

		ProfileLinkComponent,
		ProfilePreviewComponent,
		CapacityRendererComponent,
		ShareDialogComponent,
		DisplayErrorDirective,
		UserPreviewDirective,
		OrderRendererComponent,

		...forms,
		ScrollSpyDirective,
		SpiedOnElementDirective,
		BreadcrumbNavigationComponent,
		JSONLdComponent,
		EventDestinationRendererComponent,
	],
	exports: [
		MultiLevelSelectModule,
		ExpandableMaterialTableModule,
		SharedPipesModule,
		LazyLoadingModule,
		//todo remove
		SharedSearchModule,
		AutocompleteFormsModule,
		LetModule,

		EventCalendarComponent,

		PageNotFoundComponent,
		ErrorPageComponent,

		ShareDialogComponent,

		MultiImageUploadComponent,
		MultiImageContainerComponent,

		PriceRendererComponent,

		ProfileLinkComponent,

		CapacityRendererComponent,

		DisplayErrorDirective,

		UserPreviewDirective,
		OrderRendererComponent,
		ScrollSpyDirective,
		SpiedOnElementDirective,
		BreadcrumbNavigationComponent,
		JSONLdComponent,
		EventDestinationRendererComponent,

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
