import {MerchandiseDetailComponent} from "./shop/merchandise/merchandise-detail/merchandise-detail.component";
import {ProfileComponent} from "./user/profile/profile.component";
import {PartysComponent} from "./shop/partys/partys.component";
import {AccountComponent} from "./user/account.component";
import {TourDetailComponent} from "./shop/tours/tour-detail/tour-detail.component";
import {ToursComponent} from "./shop/tours/tours.component";
import {HomeComponent} from "./home/home.component";
import {PartyDetailComponent} from "./shop/partys/party-detail/party-detail.component";
import {GoogleMapsRedirectComponent} from "./util/google-maps-redirect/google-maps-redirect.component";
import {LoginComponent} from "./user/login/login.component";
import {SignUpComponent} from "./user/signup/signup.component";
import {CheckoutCartComponent} from "./shop/checkout/cart/cart.component";
import {SearchResultComponent} from "./shop/search-results/search-results.component";
import {MemberListComponent} from "./club-management/administration/member-list/member-list.component";
import {MyToursComponent} from "./user/my-tours/my-tours.component";
import {OrderHistoryComponent} from "./user/order-history/order-history.component";
import {AccountDetailsComponent} from "./user/account-details/account-details.component";
import {SettingsComponent} from "./home/settings/settings.component";
import {ImprintComponent} from "./home/imprint/imprint.component";
import {AccountingComponent} from "./club-management/accounting/accounting.component";
import {MerchandiseComponent} from "./shop/merchandise/merchandise.component";
import {TourParticipantsComponent} from "./shop/tours/tour-detail/tour-participants/tour-participants.component";
import {AuthenticatedGuard} from "./shared/route-guards/authenticated.guard";
import {IsTreasurerGuard} from "./shared/route-guards/is-treasurer.guard";
import {UnauthorizedAccessComponent} from "./user/unauthorized-access/unauthorized-access.component";
import {ProfileEditComponent} from "./user/profile/profile-edit/profile-edit.component";
import {IsOwnProfileGuard} from "./shared/route-guards/is-own-profile.guard";
import {ModifyShopItemComponent} from "./shop/modify-shop-item/modify-shop-item.component";
import {IsOrganizerGuard} from "./shared/route-guards/is-organizer.guard";
import {IsValidItemTypeGuard} from "./shared/route-guards/is-valid-itemtype.guard";
import {PageNotFoundComponent} from "./util/page-not-found/page-not-found.component";
import {CheckoutComponent} from "./shop/checkout/checkout.component";
import {MerchStockComponent} from "./club-management/administration/stock/merch-stock/merch-stock.component";
export const ROUTES = [
	{path: "", component: HomeComponent},

	//todo implement
	//nur eingeloggte user, die die Tour erstellt haben oder Organizer oder Admin sind
	{path: ":itemType/:id/edit", component: ModifyShopItemComponent, canActivate: [IsOrganizerGuard, IsValidItemTypeGuard]},
	{path: ":itemType/create", component: ModifyShopItemComponent, canActivate: [IsOrganizerGuard, IsValidItemTypeGuard]},

	{path: "tours", component: ToursComponent},
	{path: "tours/:id", component: TourDetailComponent},
	{path: "tours/:id/participants", component: TourParticipantsComponent},

	{path: "partys", component: PartysComponent},
	{path: "partys/:id", component: PartyDetailComponent},

	{path: "merch", component: MerchandiseComponent},
	{path: "merch/:id", component: MerchandiseDetailComponent},

	//todo wird das überhaupt benutzt?
	{path: "account", component: AccountComponent},

	{path: "members", component: MemberListComponent},
	{path: "members/:id", component: ProfileComponent},
	{path: "members/:id/edit", component: ProfileEditComponent, canActivate: [AuthenticatedGuard, IsOwnProfileGuard]},

	{path: "search", component: SearchResultComponent},

	{path: "login", component: LoginComponent},
	{path: "signup", redirectTo: "signup/account-data", pathMatch: "full"},
	{path: "signup/:step", component: SignUpComponent},
	{path: "cart", component: CheckoutCartComponent},
	{path: "checkout", component: CheckoutComponent, canActivate: [AuthenticatedGuard]},

	//nur eingeloggte User können diese Routen sehen
	{path: "my-events", component: MyToursComponent},
	{path: "order-history", component: OrderHistoryComponent},
	{path: "account-details", component: AccountDetailsComponent},

	//nur eingeloggte user, die Kassenwart oder Admin sind, können diese Routen sehen
	{path: "management/costs", component: AccountingComponent, canActivate: [AuthenticatedGuard, IsTreasurerGuard]},

	//todo update once there is more than one type of stock
	{path: "management/stock", redirectTo: "management/stock/merch", pathMatch: "full"},
	{path: "management/stock/merch", component: MerchStockComponent, canActivate: [AuthenticatedGuard, IsTreasurerGuard]},

	{path: "settings", component: SettingsComponent},
	{path: "impressum", component: ImprintComponent},

	{path: "not-allowed", component: UnauthorizedAccessComponent},
	{path: "redirect", component: GoogleMapsRedirectComponent},
	{path: "**", component: PageNotFoundComponent},
	{path: "page-not-found", component: PageNotFoundComponent}

];
