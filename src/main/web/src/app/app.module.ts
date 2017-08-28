import {LOCALE_ID, NgModule} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {BrowserModule} from "@angular/platform-browser";
import {AppComponent} from "./app.component";
import {RouterModule} from "@angular/router";
import {HomeComponent} from "./home/home.component";
import {ToolbarComponent} from "./home/navigation/toolbar/toolbar.component";
import {CategoryPreviewComponent} from "./home/category-preview/category-preview.component";
import {ToursComponent} from "./shop/shop-item/tours/tours.component";
import {AccountComponent} from "./user/account.component";
import {PartysComponent} from "./shop/shop-item/partys/partys.component";
import {ProfileComponent} from "./user/profile/profile.component";
import {TourDetailComponent} from "./shop/shop-item/tours/tour-detail/tour-detail.component";
import {NavigationService} from "./shared/services/navigation.service";
import {ToolbarElementComponent} from "./home/navigation/toolbar/element/toolbar-element.component";
import {SideNavComponent} from "./home/navigation/sidenav/sidenav.component";
import {PartyDetailComponent} from "./shop/shop-item/partys/party-detail/party-detail.component";
import {MerchandiseDetailComponent} from "./shop/shop-item/merchandise/merchandise-detail/merchandise-detail.component";
import {ClothesSizePipe} from "./shop/shop-item/merchandise/merchandise-detail/clothes-size.pipe";
import {ROUTES} from "./app.routes";
import {MerchandiseComponent} from "./shop/shop-item/merchandise/merchandise.component";
import {ItemDetailsContainerComponent} from "./shop/shop-item/item-details/container/item-details-container.component";
import {ItemDetailsContentComponent} from "./shop/shop-item/item-details/content/item-details-content.component";
import {ItemTableComponent} from "./shop/shop-item/item-details/details-table/item-table.component";
import {ParticipantsComponent} from "./shop/shop-item/item-details/participants/participants.component";
import {RouteComponent} from "./shop/shop-item/item-details/route/route.component";
import {SizeTableComponent} from "./shop/shop-item/item-details/size-table/size-table.component";
import {memoConfig} from "./app.config";
import {LogInService} from "./shared/services/api/login.service";
import {LoginComponent} from "./user/login/login.component";
import {PasswordStrengthBarModule} from "ng2-password-strength-bar";
import {SignUpComponent} from "./user/signup/signup.component";
import {ShoppingCartService} from "./shared/services/shopping-cart.service";
import {CheckoutCartComponent} from "./shop/checkout/cart/cart.component";
import {BadgeComponent} from "./util/badge/badge.component";
import {EventUtilityService} from "./shared/services/event-utility.service";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {ItemDetailsOverviewComponent} from "./shop/shop-item/item-details/container/overview/item-details-overview.component";
import {AccountDataFormComponent} from "./user/signup/account-data-form/account-data-form.component";
import {UserDataFormComponent} from "./user/signup/user-data-form/user-data-form.component";
import {ItemImagePopupComponent} from "./shop/shop-item/item-details/container/image-popup/item-image-popup.component";
import {ToolbarProfileLinkComponent} from "./home/navigation/toolbar/profile-link/toolbar-profile-link.component";
import {MyToursComponent} from "./user/my-tours/my-tours.component";
import {MyToursEntryComponent} from "./user/my-tours/entry/my-tours-entry.component";
import {PasswordRecoveryComponent} from "./user/password-recovery/password-recovery.component";
import {AccountingComponent} from "./club-management/accounting/accounting.component";
import {CheckoutComponent} from "./shop/checkout/checkout.component";
import {AddressSelectionComponent} from "./shop/checkout/address-selection/address-selection.component";
import {PaymentMethodSelectionComponent} from "./shop/checkout/payment/payment-method-selection.component";
import {MemberListComponent} from "./club-management/administration/member-list/member-list.component";
import {SearchResultComponent} from "./shop/search-results/search-results.component";
import {SearchInputComponent} from "./home/navigation/toolbar/search-input/search-input.component";
import {ResultsComponent} from "./shop/search-results/results/results.component";
import {ResultsEntryComponent} from "./shop/search-results/results/results-entry/results-entry.component";
import {EventService} from "./shared/services/api/event.service";
import {EntryService} from "./shared/services/api/entry.service";
import {EventFactoryService} from "./shared/services/event-factory.service";
import {OrderHistoryComponent} from "./user/order-history/order-history.component";
import {SettingsComponent} from "./home/settings/settings.component";
import {ImprintComponent} from "./home/imprint/imprint.component";
import {UserService} from "app/shared/services/api/user.service";
import {ParticipatedToursPreviewComponent} from "./user/profile/participated-tours-preview/participated-tours-preview.component";
import {ParticipantListComponent} from "./shop/shop-item/item-details/participants/participant-list/participant-list.component";
import {CacheStore} from "./shared/stores/cache.store";
import {AuthenticatedGuard} from "./shared/route-guards/authenticated.guard";
import {CanModifyItemGuard} from "./shared/route-guards/can-modify-item-guard";
import {IsTreasurerGuard} from "./shared/route-guards/is-treasurer.guard";
import {UnauthorizedAccessComponent} from "./user/unauthorized-access/unauthorized-access.component";
import {IsOwnProfileGuard} from "./shared/route-guards/is-own-profile.guard";
import {SortingDropdownComponent} from "./shop/search-results/sorting-dropdown/sorting-dropdown.component";
import {FilteringMenuComponent} from "./shop/search-results/filtering-menu/filtering-menu.component";
import {AgmCoreModule} from "@agm/core";
import {MultiLevelSelectComponent} from "./shared/multi-level-select/multi-level-select.component";
import {MultiLevelSelectEntryComponent} from "./shared/multi-level-select/multi-level-select-entry/multi-level-select-entry.component";
import {QueryParameterService} from "./shared/services/query-parameter.service";
import {ModifyShopItemComponent} from "./shop/shop-item/modify-shop-item/modify-shop-item.component";
import {IsValidItemTypeGuard} from "./shared/route-guards/is-valid-itemtype.guard";
import {PageNotFoundComponent} from "./util/page-not-found/page-not-found.component";
import {TourRouteInputComponent} from "./shop/shop-item/modify-shop-item/tour-route-input/tour-route-input.component";
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
import {AddressService} from "./shared/services/api/address.service";
import {AddressTableCellComponent} from "./club-management/administration/member-list/member-list-table-cells/address-table-cell.component";
import {AutoSizeTextAreaDirective} from "./shared/autosize-textarea.directive";
import {MemoMaterialModule} from "../material.module";
import {MerchStockComponent} from "./club-management/administration/stock/merch-stock/merch-stock.component";
import {MultiValueListExpandedRowComponent} from "./shared/expandable-table/multi-value-list-expanded-row/multi-value-list-expanded-row.component";
import {MerchStockTotalTableCellComponent} from "./club-management/administration/stock/merch-stock/merch-stock-table-cells/merch-stock-total-table-cell.component";
import {CostValueTableCellComponent} from "./club-management/accounting/accounting-table-cells/cost-value-table-cell.component";
import {ModifyTourComponent} from "./shop/shop-item/modify-shop-item/modify-tour/modify-tour.component";
import {ModifyPartyComponent} from "./shop/shop-item/modify-shop-item/modify-party/modify-party.component";
import {ModifyMerchComponent} from "./shop/shop-item/modify-shop-item/modify-merch/modify-merch.component";
import {ModifyUserComponent} from "./shop/shop-item/modify-shop-item/modify-user/modify-user.component";
import {ModifyEntryComponent} from "./shop/shop-item/modify-shop-item/modify-entry/modify-entry.component";
import {ModifyMerchStockComponent} from "./shop/shop-item/modify-shop-item/modify-merch/modify-merch-stock/modify-merch-stock.component";
import {MerchColorCellComponent} from "./shop/shop-item/modify-shop-item/modify-merch/modify-merch-stock/merch-color-cell/merch-color-cell.component";
import {ModifyMerchStockItemComponent} from "./shop/shop-item/modify-shop-item/modify-merch/modify-merch-stock/modify-merch-stock-item/modify-merch-stock-item.component";
import {AddressModificationComponent} from "./shop/checkout/address-selection/address-modification/address-modification.component";
import {ParticipantsService} from "./shared/services/api/participants.service";
import {FullNameTableCellComponent} from "./shop/shop-item/item-details/participants/participant-list/full-name-table-cell.component";
import {ModifyParticipantComponent} from "./shop/shop-item/item-details/participants/participant-list/modify-participant/modify-participant.component";
import {StockService} from "./shared/services/api/stock.service";
import {CommentService} from "app/shared/services/api/comment.service";
import {CommentsSectionComponent} from "./shop/shop-item/item-details/comments-section/comments-section.component";
import {CommentBlockComponent} from "./shop/shop-item/item-details/comments-section/comment-block/comment-block.component";
import {CommentInputComponent} from "./shop/shop-item/item-details/comments-section/comment-block/comment-input/comment-input.component";
import {SearchFilterService} from "./shared/services/search-filter.service";
import {EventCalendarComponent} from "./shared/event-calendar/event-calendar.component";
import {ScheduleModule} from "primeng/primeng";
import {EventCalendarContainerComponent} from "./shop/event-calendar-container/event-calendar-container.component";
import {AccountingOptionsComponent} from "./club-management/accounting/accounting-options/accounting-options.component";
import {EditCommentDialogComponent} from "./shop/shop-item/item-details/comments-section/edit-comment-dialog/edit-comment-dialog.component";
import {PaymentComponent} from "./shop/checkout/payment/payment.component";
import {ShareButtonsModule} from "ngx-sharebuttons";
import {CreateEventContextMenuComponent} from "./shop/event-calendar-container/create-event-context-menu/create-event-context-menu.component";
import {EventContextMenuComponent} from "./shop/event-calendar-container/event-context-menu/event-context-menu.component";
import {ConfirmationDialogComponent} from "./shared/confirmation-dialog/confirmation-dialog.component";
import {ConfirmationDialogService} from "app/shared/services/confirmation-dialog.service";
import {AddressEntryComponent} from "./user/profile/address-entry/address-entry.component";
import {DateAdapter, MD_DATE_FORMATS} from "@angular/material";
import {MOMENT_DATE_FORMATS, MomentDateAdapter} from "./shared/datepicker-config/moment-adapter";
import {CanViewStockGuard} from "./shared/route-guards/can-view-stock.guard";
import {SignUpService} from "./user/signup/shared/signup.service";
import {EntryCategoryService} from "./shared/services/api/entry-category.service";
import {EntryCategoryCellComponent} from "./club-management/accounting/accounting-table-cells/entry-category-cell.component";
import {UserBankAccountService} from "./shared/services/api/user-bank-account.service";
import {OrderService} from "./shared/services/api/order.service";
import {ErrorPageComponent} from "./util/error-page/error-page.component";
import {OrderHistoryEntryComponent} from "./user/order-history/order-history-entry/order-history-entry.component";
import {ModifyItemService} from "./shop/shop-item/modify-shop-item/shared/modify-item.service";
import {HttpClientModule} from "@angular/common/http";
import {ImageUploadService} from "./shared/services/api/image-upload.service";

@NgModule({
	imports: [
		BrowserModule,
		FormsModule,
		HttpClientModule,
		ReactiveFormsModule,
		BrowserAnimationsModule,
		MemoMaterialModule,
		RouterModule.forRoot(ROUTES),
		AgmCoreModule.forRoot({
			apiKey: memoConfig.mapsApiKey,
			libraries: ["places"]
		}),
		ColorPickerModule,
		PasswordStrengthBarModule,
		ImageCropperModule,
		ScheduleModule,
		ShareButtonsModule.forRoot()
	],
	declarations: [
		AppComponent,
		ClothesSizePipe,
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
		MyToursComponent,
		MyToursEntryComponent,
		PasswordRecoveryComponent,
		AccountingComponent,
		CheckoutComponent,
		AddressSelectionComponent,
		PaymentMethodSelectionComponent,
		MemberListComponent,
		SearchResultComponent,
		SearchInputComponent,
		ResultsComponent,
		ResultsEntryComponent,
		OrderHistoryComponent,
		SettingsComponent,
		ImprintComponent,
		ParticipatedToursPreviewComponent,
		ParticipantListComponent,
		UnauthorizedAccessComponent,
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
		AddressModificationComponent,

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
		ModifyTourComponent,
		ModifyPartyComponent,
		ModifyMerchComponent,
		ModifyUserComponent,
		ModifyEntryComponent,
		ModifyMerchStockComponent,
		MerchColorCellComponent,
		ModifyMerchStockItemComponent,
		FullNameTableCellComponent,
		ModifyParticipantComponent,
		CommentsSectionComponent,
		CommentBlockComponent,
		CommentInputComponent,
		EventCalendarComponent,
		EventCalendarContainerComponent,
		AccountingOptionsComponent,
		EditCommentDialogComponent,
		PaymentComponent,
		EventContextMenuComponent,
		CreateEventContextMenuComponent,
		ConfirmationDialogComponent,
		AddressEntryComponent,
		EntryCategoryCellComponent,
		ErrorPageComponent,
		OrderHistoryEntryComponent
	],
	bootstrap: [
		AppComponent
	],
	providers: [
		NavigationService, UserService, CacheStore, ParticipantsService, CommentService,
		LogInService, ShoppingCartService, EventUtilityService, EventService, AddressService,
		EntryService, EventFactoryService, QueryParameterService, StockService, SearchFilterService,
		ConfirmationDialogService, SignUpService, EntryCategoryService, UserBankAccountService, OrderService,
		ModifyItemService, ImageUploadService,

		//guards
		AuthenticatedGuard, CanModifyItemGuard, IsTreasurerGuard, IsOwnProfileGuard, IsValidItemTypeGuard,
		CanViewStockGuard,

		{provide: LOCALE_ID, useValue: "de-DE"},
		{provide: DateAdapter, useClass: MomentDateAdapter},
		{provide: MD_DATE_FORMATS, useValue: MOMENT_DATE_FORMATS},
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
		MerchColorCellComponent,
		FullNameTableCellComponent,
		ModifyParticipantComponent,
		EditCommentDialogComponent,
		CreateEventContextMenuComponent,
		EventContextMenuComponent,
		ConfirmationDialogComponent,
		EntryCategoryCellComponent
	]
})
export class AppModule {
}
