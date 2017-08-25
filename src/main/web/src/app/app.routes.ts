import {MerchandiseDetailComponent} from "./shop/shop-item/merchandise/merchandise-detail/merchandise-detail.component";
import {ProfileComponent} from "./user/profile/profile.component";
import {PartysComponent} from "./shop/shop-item/partys/partys.component";
import {TourDetailComponent} from "./shop/shop-item/tours/tour-detail/tour-detail.component";
import {ToursComponent} from "./shop/shop-item/tours/tours.component";
import {HomeComponent} from "./home/home.component";
import {PartyDetailComponent} from "./shop/shop-item/partys/party-detail/party-detail.component";
import {LoginComponent} from "./user/login/login.component";
import {SignUpComponent} from "./user/signup/signup.component";
import {CheckoutCartComponent} from "./shop/checkout/cart/cart.component";
import {SearchResultComponent} from "./shop/search-results/search-results.component";
import {MemberListComponent} from "./club-management/administration/member-list/member-list.component";
import {MyToursComponent} from "./user/my-tours/my-tours.component";
import {OrderHistoryComponent} from "./user/order-history/order-history.component";
import {SettingsComponent} from "./home/settings/settings.component";
import {ImprintComponent} from "./home/imprint/imprint.component";
import {AccountingComponent} from "./club-management/accounting/accounting.component";
import {MerchandiseComponent} from "./shop/shop-item/merchandise/merchandise.component";
import {ParticipantListComponent} from "./shop/shop-item/item-details/participants/participant-list/participant-list.component";
import {AuthenticatedGuard} from "./shared/route-guards/authenticated.guard";
import {IsTreasurerGuard} from "./shared/route-guards/is-treasurer.guard";
import {UnauthorizedAccessComponent} from "./user/unauthorized-access/unauthorized-access.component";
import {IsOwnProfileGuard} from "./shared/route-guards/is-own-profile.guard";
import {ModifyShopItemComponent} from "./shop/shop-item/modify-shop-item/modify-shop-item.component";
import {CanModifyItemGuard} from "./shared/route-guards/can-modify-item-guard";
import {IsValidItemTypeGuard} from "./shared/route-guards/is-valid-itemtype.guard";
import {PageNotFoundComponent} from "./util/page-not-found/page-not-found.component";
import {CheckoutComponent} from "./shop/checkout/checkout.component";
import {MerchStockComponent} from "./club-management/administration/stock/merch-stock/merch-stock.component";
import {AddressModificationComponent} from "./shop/checkout/address-selection/address-modification/address-modification.component";
import {EventCalendarContainerComponent} from "./shop/event-calendar-container/event-calendar-container.component";
import {ModifyUserComponent} from "./shop/shop-item/modify-shop-item/modify-user/modify-user.component";
import {CanViewStockGuard} from "./shared/route-guards/can-view-stock.guard";
import {Route} from "@angular/router";

export const ROUTES: Route[] = [
	{path: "", component: HomeComponent},

	//todo implement
	//nur eingeloggte user, die die Tour erstellt haben oder Organizer oder Admin sind
	{
		path: ":itemType/:id/edit",
		component: ModifyShopItemComponent,
		canActivate: [IsValidItemTypeGuard, CanModifyItemGuard]
	},
	{
		path: ":itemType/create",
		component: ModifyShopItemComponent,
		canActivate: [IsValidItemTypeGuard, CanModifyItemGuard]
	},

	{
		path: ":itemType/:eventId/costs",
		component: AccountingComponent,
		canActivate: [/*todo is-event guard*/ IsTreasurerGuard]
	},
	{
		path: ":itemType/:eventId/costs/:id/edit",
		component: ModifyShopItemComponent,
		canActivate: [/*todo is-event guard*/ CanModifyItemGuard]
	},
	{
		path: ":itemType/:eventId/costs/create",
		component: ModifyShopItemComponent,
		canActivate: [/*todo is-event guard*/ CanModifyItemGuard]
	},


	{path: "tours", component: ToursComponent},
	{path: "tours/:id", component: TourDetailComponent},
	{path: "tours/:id/participants", component: ParticipantListComponent},

	{path: "partys", component: PartysComponent},
	{path: "partys/:id", component: PartyDetailComponent},
	{path: "partys/:id/participants", component: ParticipantListComponent},

	{path: "merch", component: MerchandiseComponent},
	{path: "merch/:id", component: MerchandiseDetailComponent},

	{path: "calendar", component: EventCalendarContainerComponent},

	{path: "members", component: MemberListComponent},
	{path: "members/:id", component: ProfileComponent},
	{path: "members/:id/edit", component: ModifyUserComponent, canActivate: [AuthenticatedGuard, IsOwnProfileGuard]},
	{path: "members/:id/address", component: AddressModificationComponent, canActivate: [AuthenticatedGuard]},
	{path: "address", component: AddressModificationComponent},

	{path: "search", component: SearchResultComponent},

	{path: "login", component: LoginComponent},
	{path: "signup", redirectTo: "signup/account-data", pathMatch: "full"},
	{path: "signup/:step", component: SignUpComponent},
	{path: "cart", component: CheckoutCartComponent},
	{path: "checkout", component: CheckoutComponent, canActivate: [AuthenticatedGuard]},

	//nur eingeloggte User können diese Routen sehen
	{path: "my-events", component: MyToursComponent},
	{path: "order-history", component: OrderHistoryComponent},

	//nur eingeloggte user, die Kassenwart oder Admin sind, können diese Routen sehen
	{path: "management/costs", component: AccountingComponent, canActivate: [AuthenticatedGuard, IsTreasurerGuard]},

	//todo update once there is more than one type of stock
	{path: "management/stock", redirectTo: "management/stock/merch", pathMatch: "full"},
	{
		path: "management/stock/merch",
		component: MerchStockComponent,
		canActivate: [AuthenticatedGuard, CanViewStockGuard]
	},


	{path: "settings", component: SettingsComponent},
	{path: "impressum", component: ImprintComponent},

	{path: "not-allowed", component: UnauthorizedAccessComponent},
	{path: "**", component: PageNotFoundComponent},
	{path: "page-not-found", component: PageNotFoundComponent}

];
