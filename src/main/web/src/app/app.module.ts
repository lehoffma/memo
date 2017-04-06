import {LOCALE_ID, NgModule} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {BrowserModule} from "@angular/platform-browser";
import {AppComponent} from "./app.component";
import {RouterModule} from "@angular/router";
import {HomeComponent} from "./home/home.component";
import {MaterialModule} from "@angular/material";
import {ToolbarComponent} from "./navigation/toolbar/toolbar.component";
import {CategoryPreviewComponent} from "./home/category-preview/category-preview.component";
import {ToursComponent} from "./shop/tours/tours.component";
import {AccountComponent} from "./user/account.component";
import {PartysComponent} from "./shop/partys/partys.component";
import {PartyStore} from "./shared/stores/party.store";
import {ProfileComponent} from "./user/profile/profile.component";
import {TourDetailComponent} from "./shop/tours/tour-detail/tour-detail.component";
import {NavigationService} from "./shared/services/navigation.service";
import {ToolbarElementComponent} from "./navigation/toolbar/element/toolbar-element.component";
import {SideNavComponent} from "./navigation/sidenav/sidenav.component";
import {UserStore} from "./shared/stores/user.store";
import {MerchStore} from "./shared/stores/merch.store";
import {TourStore} from "./shared/stores/tour.store";
import {PartyDetailComponent} from "./shop/partys/party-detail/party-detail.component";
import {MerchandiseDetailComponent} from "./shop/merchandise/merchandise-detail/merchandise-detail.component";
import {AddressStore} from "./shared/stores/adress.store";
import {ClothesSizePipe} from "./shop/merchandise/merchandise-detail/clothes-size.pipe";
import {AgmCoreModule} from "angular2-google-maps/core";
import {ROUTES} from "./app.routes";
import {GoogleMapsRedirectComponent} from "./util/google-maps-redirect/google-maps-redirect.component";
import {MerchandiseComponent} from "./shop/merchandise/merchandise.component";
import {ItemDetailsContainerComponent} from "./shop/item-details/container/item-details-container.component";
import {ItemDetailsContentComponent} from "./shop/item-details/content/item-details-content.component";
import {KeysOfObjectPipe} from "./shared/pipes/keys-of-object.pipe";
import {ItemTableComponent} from "./shop/item-details/details-table/item-table.component";
import {ConvertCamelCaseToTitleCasePipe} from "./shared/pipes/convert-camelcase-to-titlecase.pipe";
import {ParticipantsComponent} from "./shop/item-details/participants/participants.component";
import {RouteComponent} from "./shop/item-details/route/route.component";
import {DetailsSelectionComponent} from "./shop/item-details/selection/object-details-selection.component";
import {FilterPipe} from "./shared/pipes/filter.pipe";
import {SizeTableComponent} from "./shop/item-details/size-table/size-table.component";
import {memoConfig} from "./app.config";
import {LogInService} from "./shared/services/login.service";
import {LoginComponent} from "./user/login/login.component";
import {PasswordStrengthBarModule} from "ng2-password-strength-bar";
import {SignUpComponent} from "./user/signup/signup.component";
import {Md2Module} from "md2";
import {ShoppingCartService} from "./shared/services/shopping-cart.service";
import {CheckoutCartComponent} from "./shop/checkout/cart/cart.component";
import {BadgeComponent} from "./util/badge/badge.component";
import {EventService} from "./shared/services/event.service";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {ItemDetailsOverviewComponent} from "./shop/item-details/container/overview/item-details-overview.component";
import {AccountDataFormComponent} from "./user/signup/account-data-form/account-data-form.component";
import {UserDataFormComponent} from "./user/signup/user-data-form/user-data-form.component";
import {ImageUploadModule} from "angular2-image-upload";
import {ImageUploadPreviewComponent} from "./user/signup/user-data-form/image-upload-preview/image-upload-preview.component";
import {ItemImagePopupComponent} from "./shop/item-details/container/image-popup/item-image-popup.component";
import {ToolbarProfileLinkComponent} from "./navigation/toolbar/profile-link/toolbar-profile-link.component";
import {AccountDetailsComponent} from "./user/account-details/account-details.component";
import {MyToursComponent} from "./user/my-tours/my-tours.component";
import {MyToursEntryComponent} from "./user/my-tours/entry/my-tours-entry.component";
import {PasswordRecoveryComponent} from "./user/password-recovery/password-recovery.component";
import {AccountingComponent} from "./club-management/accounting/accounting.component";
import {AccountingEntryComponent} from "./club-management/accounting/accounting-entry/accounting-entry.component";
import {CheckoutComponent} from "./shop/checkout/checkout.component";
import {AddressCheckComponent} from "./shop/checkout/address-check/address-check.component";
import {PaymentComponent} from "./shop/checkout/payment/payment.component";
import {CartEntryComponent} from "./shop/checkout/cart/cart-entry/cart-entry.component";
import {ClubAdministrationComponent} from "./club-management/administration/club-administration.component";
import {StockComponent} from "./club-management/administration/stock/stock.component";
import {CostsComponent} from "./club-management/administration/costs/costs.component";
import {MemberListComponent} from "./club-management/administration/member-list/member-list.component";

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
		SideNavComponent,
		ToolbarComponent,
		ToolbarElementComponent,
		HomeComponent,
		CategoryPreviewComponent,
		ItemDetailsContainerComponent,
		ItemDetailsContentComponent,
		ParticipantsComponent,
		RouteComponent,
		ItemTableComponent,
		DetailsSelectionComponent,
		SizeTableComponent,
		ToursComponent,
		TourDetailComponent,
		AccountComponent,
		PartysComponent,
		PartyDetailComponent,
		MerchandiseComponent,
		MerchandiseDetailComponent,
		ProfileComponent,
		LoginComponent,
		SignUpComponent,
		CheckoutCartComponent,
		BadgeComponent,
		ItemDetailsOverviewComponent,
		AccountDataFormComponent,
		UserDataFormComponent,
		ImageUploadPreviewComponent,
		ItemImagePopupComponent,
		ToolbarProfileLinkComponent,
		AccountDetailsComponent,
		MyToursComponent,
		MyToursEntryComponent,
		PasswordRecoveryComponent,
		AccountingComponent,
		AccountingEntryComponent,
		CheckoutComponent,
		AddressCheckComponent,
		PaymentComponent,
		CartEntryComponent,
		ClubAdministrationComponent,
		StockComponent,
		CostsComponent,
		MemberListComponent
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
		ItemImagePopupComponent,
	]
})
export class AppModule {
}
