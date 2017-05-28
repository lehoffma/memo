import {LOCALE_ID, NgModule} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {BrowserModule} from "@angular/platform-browser";
import {AppComponent} from "./app.component";
import {RouterModule} from "@angular/router";
import {HomeComponent} from "./home/home.component";
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
import {ClothesSizePipe} from "./shop/merchandise/merchandise-detail/clothes-size.pipe";
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
import {ItemImagePopupComponent} from "./shop/item-details/container/image-popup/item-image-popup.component";
import {ToolbarProfileLinkComponent} from "./home/navigation/toolbar/profile-link/toolbar-profile-link.component";
import {AccountDetailsComponent} from "./user/account-details/account-details.component";
import {MyToursComponent} from "./user/my-tours/my-tours.component";
import {MyToursEntryComponent} from "./user/my-tours/entry/my-tours-entry.component";
import {PasswordRecoveryComponent} from "./user/password-recovery/password-recovery.component";
import {AccountingComponent} from "./club-management/accounting/accounting.component";
import {CheckoutComponent} from "./shop/checkout/checkout.component";
import {AddressCheckComponent} from "./shop/checkout/address-check/address-check.component";
import {PaymentComponent} from "./shop/checkout/payment/payment.component";
import {ClubAdministrationComponent} from "./club-management/administration/club-administration.component";
import {StockComponent} from "./club-management/administration/stock/stock.component";
import {MemberListComponent} from "./club-management/administration/member-list/member-list.component";
import {SearchResultComponent} from "./shop/search-results/search-results.component";
import {SearchInputComponent} from "./home/navigation/toolbar/search-input/search-input.component";
import {ResultsComponent} from "./shop/search-results/results/results.component";
import {ResultsEntryComponent} from "./shop/search-results/results/results-entry/results-entry.component";
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
import {ProfileEditComponent} from "./user/profile/profile-edit/profile-edit.component";
import {IsOwnProfileGuard} from "./shared/route-guards/is-own-profile.guard";
import {SortingDropdownComponent} from "./shop/search-results/sorting-dropdown/sorting-dropdown.component";
import {FilteringMenuComponent} from "./shop/search-results/filtering-menu/filtering-menu.component";
import {AgmCoreModule} from "@agm/core";
import {MultiLevelSelectComponent} from "./shared/multi-level-select/multi-level-select.component";
import {MultiLevelSelectEntryComponent} from "./shared/multi-level-select/multi-level-select-entry/multi-level-select-entry.component";
import {QueryParameterService} from "./shared/services/query-parameter.service";
import {ModifyShopItemComponent} from "./shop/modify-shop-item/modify-shop-item.component";
import {IsValidItemTypeGuard} from "./shared/route-guards/is-valid-itemtype.guard";
import {PageNotFoundComponent} from "./util/page-not-found/page-not-found.component";
import {TourRouteInputComponent} from "./shop/modify-shop-item/tour-route-input/tour-route-input.component";
import {ColorPickerModule} from "ngx-color-picker";
import {ProfilePictureFormComponent} from "./user/signup/profile-picture-form/profile-picture-form.component";
import {PaymentMethodsFormComponent} from "./user/signup/payment-methods-form/payment-methods-form.component";
import {DebitInputFormComponent} from "./user/signup/payment-methods-form/debit-input-form/debit-input-form.component";
import {ImageCropperModule} from "ng2-image-cropper";
import {CartEntryComponent} from "./shop/checkout/cart/cart-entry/cart-entry.component";
import {ExpandableTableComponent} from "./shared/expandable-table/expandable-table.component";
import {ExpandedTableRowContainerDirective} from "./shared/expandable-table/expanded-table-row-container.directive";
import {SingleValueListExpandedRowComponent} from "./shared/expandable-table/single-value-list-expanded-row/single-value-list-expanded-row.component";
import {ExpandableTableColumnContainerDirective} from "./shared/expandable-table/expandable-table-column-container.directive";
import {DefaultExpandableTableCellComponent} from "./shared/expandable-table/default-expandable-table-cell.component";
import {DateTableCellComponent} from "./club-management/administration/member-list/member-list-table-cells/date-table-cell.component";
import {ClubRoleTableCellComponent} from "./club-management/administration/member-list/member-list-table-cells/clubrole-table-cell.component";
import {BooleanCheckMarkCellComponent} from "./club-management/administration/member-list/member-list-table-cells/boolean-checkmark-cell.component";
import {GenderCellComponent} from "./club-management/administration/member-list/member-list-table-cells/gender-cell.component";
import {AddressService} from "./shared/services/address.service";
import {AddressTableCellComponent} from "./club-management/administration/member-list/member-list-table-cells/address-table-cell.component";
import {AutoSizeTextAreaDirective} from "./shop/modify-shop-item/autosize-textarea.directive";
import {HttpModule} from "@angular/http";
import {MemoMaterialModule} from "../material.module";
import {MerchStockComponent} from "./club-management/administration/stock/merch-stock/merch-stock.component";
import {MultiValueListExpandedRowComponent} from "./shared/expandable-table/multi-value-list-expanded-row/multi-value-list-expanded-row.component";
import {MerchStockTotalTableCellComponent} from "./club-management/administration/stock/merch-stock/merch-stock-table-cells/merch-stock-total-table-cell.component";
import {CostValueTableCellComponent} from "./club-management/accounting/accounting-table-cells/cost-value-table-cell.component";
import {CostCategoryTableCellComponent} from "./club-management/accounting/accounting-table-cells/cost-category-table-cell.component";
import {ModifyTourComponent} from "./shop/modify-shop-item/modify-tour/modify-tour.component";
import {ModifyPartyComponent} from "./shop/modify-shop-item/modify-party/modify-party.component";
import {ModifyMerchComponent} from "./shop/modify-shop-item/modify-merch/modify-merch.component";
import {ModifyUserComponent} from "./shop/modify-shop-item/modify-user/modify-user.component";
import {ModifyEntryComponent} from "./shop/modify-shop-item/modify-entry/modify-entry.component";
import {ModifyMerchStockComponent} from "./shop/modify-shop-item/modify-merch/modify-merch-stock/modify-merch-stock.component";
import {MerchColorCellComponent} from "./shop/modify-shop-item/modify-merch/modify-merch-stock/merch-color-cell/merch-color-cell.component";
import {ModifyMerchStockItemComponent} from "./shop/modify-shop-item/modify-merch/modify-merch-stock/modify-merch-stock-item/modify-merch-stock-item.component";
import {AddressChangeComponent} from "./shop/checkout/cart/adress-change/address-change.component";

@NgModule({
	imports: [
		BrowserModule,
		FormsModule,
		HttpModule,
		ReactiveFormsModule,
		BrowserAnimationsModule,
		MemoMaterialModule,
		RouterModule.forRoot(ROUTES),
		AgmCoreModule.forRoot({
			apiKey: memoConfig.mapsApiKey,
			libraries: ["places"]
		}),
		Md2Module,
		ColorPickerModule,
		PasswordStrengthBarModule,
		ImageCropperModule
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
		ItemImagePopupComponent,
		ToolbarProfileLinkComponent,
		AccountDetailsComponent,
		MyToursComponent,
		MyToursEntryComponent,
		PasswordRecoveryComponent,
		AccountingComponent,
		CheckoutComponent,
		AddressCheckComponent,
		PaymentComponent,
		ClubAdministrationComponent,
		StockComponent,
		MemberListComponent,
		SearchResultComponent,
		SearchInputComponent,
		ResultsComponent,
		ResultsEntryComponent,
		OrderHistoryComponent,
		SettingsComponent,
		ImprintComponent,
		ParticipatedToursPreviewComponent,
		TourParticipantsComponent,
		UnauthorizedAccessComponent,
		ProfileEditComponent,
		SortingDropdownComponent,
		FilteringMenuComponent,
		MultiLevelSelectComponent,
		MultiLevelSelectEntryComponent,
		ModifyShopItemComponent,
		PageNotFoundComponent,
		TourRouteInputComponent,
		CartEntryComponent,
		ProfilePictureFormComponent,
		PaymentMethodsFormComponent,
		DebitInputFormComponent,
		AddressChangeComponent,

		ExpandableTableComponent,
		ExpandedTableRowContainerDirective,
		SingleValueListExpandedRowComponent,
		ExpandableTableColumnContainerDirective,
		DefaultExpandableTableCellComponent,
		DateTableCellComponent,
		ClubRoleTableCellComponent,
		BooleanCheckMarkCellComponent,
		GenderCellComponent,
		AddressTableCellComponent,

		AutoSizeTextAreaDirective,
		MerchStockComponent,
		MultiValueListExpandedRowComponent,
		MerchStockTotalTableCellComponent,
		CostValueTableCellComponent,
		CostCategoryTableCellComponent,
		ModifyTourComponent,
		ModifyPartyComponent,
		ModifyMerchComponent,
		ModifyUserComponent,
		ModifyEntryComponent,
		ModifyMerchStockComponent,
		MerchColorCellComponent,
		ModifyMerchStockItemComponent
	],
	bootstrap: [
		AppComponent
	],
	providers: [
		NavigationService, UserService, CacheStore,
		LogInService, ShoppingCartService, EventUtilityService, EventService, AddressService,
		EntryService, EventFactoryService, QueryParameterService,

		//guards
		AuthenticatedGuard, IsOrganizerGuard, IsTreasurerGuard, IsOwnProfileGuard, IsValidItemTypeGuard,

		{provide: LOCALE_ID, useValue: "de-DE"}
	],
	entryComponents: [
		ItemImagePopupComponent,
		ModifyMerchStockItemComponent,

		SingleValueListExpandedRowComponent,
		DefaultExpandableTableCellComponent,
		DateTableCellComponent,
		ClubRoleTableCellComponent,
		BooleanCheckMarkCellComponent,
		GenderCellComponent,
		AddressTableCellComponent,

		MultiValueListExpandedRowComponent,
		MerchStockTotalTableCellComponent,
		CostValueTableCellComponent,
		CostCategoryTableCellComponent,
		MerchColorCellComponent
	]
})
export class AppModule {
}
