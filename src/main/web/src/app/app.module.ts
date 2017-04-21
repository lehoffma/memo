import {LOCALE_ID, NgModule} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {BrowserModule} from "@angular/platform-browser";
import {AppComponent} from "./app.component";
import {RouterModule} from "@angular/router";
import {HomeComponent} from "./home/home.component";
import {MaterialModule} from "@angular/material";
import {ToolbarComponent} from "./home/navigation/toolbar/toolbar.component";
import {CategoryPreviewComponent} from "./home/category-preview/category-preview.component";
import {ToursComponent} from "./shop/tours/tours.component";
import {AccountComponent} from "./user/account.component";
import {PartysComponent} from "./shop/partys/partys.component";
import {ProfileComponent} from "./user/profile/profile.component";
import {TourDetailComponent} from "./shop/tours/tour-detail/tour-detail.component";
import {NavigationService} from "./shared/services/navigation.service";
import {ToolbarElementComponent} from "./home/navigation/toolbar/element/toolbar-element.component";
import {SideNavComponent} from "./home/navigation/sidenav/sidenav.component";
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
import {EventUtilityService} from "./shared/services/event-utility.service";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {ItemDetailsOverviewComponent} from "./shop/item-details/container/overview/item-details-overview.component";
import {AccountDataFormComponent} from "./user/signup/account-data-form/account-data-form.component";
import {UserDataFormComponent} from "./user/signup/user-data-form/user-data-form.component";
import {ImageUploadModule} from "angular2-image-upload";
import {ImageUploadPreviewComponent} from "./user/signup/user-data-form/image-upload-preview/image-upload-preview.component";
import {ItemImagePopupComponent} from "./shop/item-details/container/image-popup/item-image-popup.component";
import {ToolbarProfileLinkComponent} from "./home/navigation/toolbar/profile-link/toolbar-profile-link.component";
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
import {MemberListComponent} from "./club-management/administration/member-list/member-list.component";
import {SearchResultComponent} from "./shop/search-results/search-results.component";
import {SearchInputComponent} from "./home/navigation/toolbar/search-input/search-input.component";
import {ResultsCategoryComponent} from "./shop/search-results/results-category/results-category.component";
import {ResultsCategoryEntryComponent} from "./shop/search-results/results-category/results-category-entry/results-category-entry.component";
import {EventService} from "./shared/services/event.service";
import {EntryService} from "./shared/services/entry.service";
import {EventFactoryService} from "./shared/services/event-factory.service";
import {OrderHistoryComponent} from "./user/order-history/order-history.component";
import {SettingsComponent} from "./home/settings/settings.component";
import {ImprintComponent} from "./home/imprint/imprint.component";
import {UserService} from "app/shared/services/user.service";
import {ParticipatedToursPreviewComponent} from "./user/profile/participated-tours-preview/participated-tours-preview.component";
import {TourParticipantsComponent} from "./shop/tours/tour-detail/tour-participants/tour-participants.component";
import {CacheStore} from "./shared/stores/cache.store";
import {AuthenticatedGuard} from "./shared/route-guards/authenticated.guard";
import {IsOrganizerGuard} from "./shared/route-guards/is-organizer.guard";
import {IsTreasurerGuard} from "./shared/route-guards/is-treasurer.guard";
import {UnauthorizedAccessComponent} from "./user/unauthorized-access/unauthorized-access.component";
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
		MemberListComponent,
		SearchResultComponent,
		SearchInputComponent,
		ResultsCategoryComponent,
		ResultsCategoryEntryComponent,
		OrderHistoryComponent,
		SettingsComponent,
		ImprintComponent,
		ParticipatedToursPreviewComponent,
		TourParticipantsComponent,
		UnauthorizedAccessComponent
	],
	bootstrap: [
		AppComponent
	],
	providers: [
		NavigationService, AddressStore, UserService, CacheStore,
		LogInService, ShoppingCartService, EventUtilityService, EventService,
		EntryService, EventFactoryService,

		//guards
		AuthenticatedGuard, IsOrganizerGuard, IsTreasurerGuard,

		{provide: LOCALE_ID, useValue: "de-DE"}
	],
	entryComponents: [
		ItemImagePopupComponent,
	]
})
export class AppModule {
}
