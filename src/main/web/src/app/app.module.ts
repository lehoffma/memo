import {LOCALE_ID, NgModule} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {BrowserModule} from "@angular/platform-browser";
import {AppComponent} from "./app.component";
import {RouterModule} from "@angular/router";
import {OverViewComponent} from "./overview/overview.component";
import {MaterialModule} from "@angular/material";
import {NavigationComponent} from "./navigation/toolbar/navigation-toolbar.component";
import {OverViewPreviewComponent} from "./overview/preview/overview-preview.component";
import {ToursComponent} from "./tours/tours.component";
import {AccountComponent} from "./account/account.component";
import {PartysComponent} from "./partys/partys.component";
import {PartyStore} from "./shared/stores/party.store";
import {AccountProfileComponent} from "./account/profile/account-profile.component";
import {TourDetailComponent} from "./tours/tours-detail/tours-detail.component";
import {NavigationService} from "./shared/services/navigation.service";
import {NavigationElementComponent} from "./navigation/toolbar/element/navigation-toolbar-element.component";
import {NavigationSideNavComponent} from "./navigation/sidenav/navigation-sidenav.component";
import {UserStore} from "./shared/stores/user.store";
import {MerchStore} from "./shared/stores/merch.store";
import {TourStore} from "./shared/stores/tour.store";
import {PartyDetailComponent} from "./partys/party-detail/party-detail.component";
import {MerchDetailComponent} from "./merchandise/merchandise-detail/merchandise-detail.component";
import {AddressStore} from "./shared/stores/adress.store";
import {ClothesSizePipe} from "./merchandise/merchandise-detail/clothes-size.pipe";
import {AgmCoreModule} from "angular2-google-maps/core";
import {ROUTES} from "./app.routes";
import {GoogleMapsRedirectComponent} from "./util/google-maps-redirect/google-maps-redirect.component";
import {MerchComponent} from "./merchandise/merchandise.component";
import {ObjectDetailsContainerComponent} from "./object-details/container/object-details-container.component";
import {ObjectDetailsContentComponent} from "./object-details/content/object-details-content.component";
import {KeysOfObjectPipe} from "./shared/pipes/keys-of-object.pipe";
import {DetailsTableComponent} from "./object-details/details-table/object-details-table.component";
import {ConvertCamelCaseToTitleCasePipe} from "./shared/pipes/convert-camelcase-to-titlecase.pipe";
import {DetailsParticipantsComponent} from "./object-details/participants/object-details-participants.component";
import {DetailsRouteComponent} from "./object-details/route/object-details-route.component";
import {DetailsSelectionComponent} from "./object-details/selection/object-details-selection.component";
import {FilterPipe} from "./shared/pipes/filter.pipe";
import {DetailsSizeTableComponent} from "./object-details/size-table/object-details-size-table.component";
import {memoConfig} from "./app.config";
import {LogInService} from "./shared/services/login.service";
import {AccountLoginComponent} from "./account/login/account-login.component";
import {PasswordStrengthBarModule} from "ng2-password-strength-bar";
import {AccountSignUpComponent} from "./account/signup/account-signup.component";
import {Md2Module} from "md2";
import {ShoppingCartService} from "./shared/services/shopping-cart.service";
import {CheckoutCartComponent} from "./checkout/cart/checkout-cart.component";
import {BadgeComponent} from "./util/badge/badge.component";
import {EventService} from "./shared/services/event.service";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {ObjectDetailsOverviewComponent} from "./object-details/container/object-details-overview/object-details-overview.component";
import {AccountDataFormComponent} from "./account/signup/account-data-form/account-data-form.component";
import {UserDataFormComponent} from "./account/signup/user-data-form/user-data-form.component";
import {ImageUploadModule} from "angular2-image-upload";
import {ImageUploadPreviewComponent} from "./account/signup/user-data-form/image-upload-preview/image-upload-preview.component";
import {ObjectImagePopupComponent} from "./object-details/container/object-image-popup/object-image-popup.component";

@NgModule({
	imports: [
		BrowserModule,
		FormsModule,
		ReactiveFormsModule,
		MaterialModule,
		BrowserAnimationsModule,
		RouterModule.forRoot(ROUTES),
		AgmCoreModule.forRoot({
			apiKey: memoConfig.mapsApiKey
		}),
		Md2Module,
		PasswordStrengthBarModule,
		ImageUploadModule.forRoot()
	],
	declarations: [
		AppComponent,
		GoogleMapsRedirectComponent,
		ClothesSizePipe,
		KeysOfObjectPipe,
		FilterPipe,
		ConvertCamelCaseToTitleCasePipe,
		NavigationSideNavComponent,
		NavigationComponent,
		NavigationElementComponent,
		OverViewComponent,
		OverViewPreviewComponent,
		ObjectDetailsContainerComponent,
		ObjectDetailsContentComponent,
		DetailsParticipantsComponent,
		DetailsRouteComponent,
		DetailsTableComponent,
		DetailsSelectionComponent,
		DetailsSizeTableComponent,
		ToursComponent,
		TourDetailComponent,
		AccountComponent,
		PartysComponent,
		PartyDetailComponent,
		MerchComponent,
		MerchDetailComponent,
		AccountProfileComponent,
		AccountLoginComponent,
		AccountSignUpComponent,
		CheckoutCartComponent,
		BadgeComponent,
		ObjectDetailsOverviewComponent,
		AccountDataFormComponent,
		UserDataFormComponent,
		ImageUploadPreviewComponent,
		ObjectImagePopupComponent
	],
	bootstrap: [
		AppComponent
	],
	providers: [
		NavigationService, AddressStore, PartyStore, MerchStore, TourStore, UserStore,
		LogInService, ShoppingCartService, EventService,

		{provide: LOCALE_ID, useValue: "de-DE"}
	],
	entryComponents: [
		ObjectImagePopupComponent,
	]
})
export class AppModule {
}
