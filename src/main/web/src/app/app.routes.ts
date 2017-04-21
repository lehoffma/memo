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
import {StockComponent} from "./club-management/administration/stock/stock.component";
import {MerchandiseComponent} from "./shop/merchandise/merchandise.component";
import {TourParticipantsComponent} from "./shop/tours/tour-detail/tour-participants/tour-participants.component";
import {AuthenticatedGuard} from "./shared/route-guards/authenticated.guard";
import {IsTreasurerGuard} from "./shared/route-guards/is-treasurer.guard";
import {UnauthorizedAccessComponent} from "./user/unauthorized-access/unauthorized-access.component";
export const ROUTES = [
	{path: "", component: HomeComponent},

	{path: "tours", component: ToursComponent},
	{path: "tours/:id", component: TourDetailComponent},
	{path: "tours/:id/participants", component: TourParticipantsComponent},
	//todo implement
	//nur eingeloggte user, die die Tour erstellt haben oder Admin sind
	//{path: "tours/:id/edit", component: TourEditComponent},

	{path: "partys", component: PartysComponent},
	{path: "partys/:id", component: PartyDetailComponent},
	//todo implement
	//nur eingeloggte user, die die Party erstellt haben oder Admin sind
	//{path: "party/:id/edit", component: PartyEditComponent},

	{path: "merch", component: MerchandiseComponent},
	{path: "merch/:id", component: MerchandiseDetailComponent},
	//todo implement
	//nur eingeloggte user, die das Merchandise-Objekt erstellt haben oder Admin sind
	//{path: "merch/:id/edit", component: MerchEditComponent},

	//todo wird das überhaupt benutzt?
	{path: "account", component: AccountComponent},

	{path: "members", component: MemberListComponent},
	{path: "members/:id", component: ProfileComponent},

	//nur eingeloggte User können diese Routen sehen
	{path: "my-events", component: MyToursComponent},
	{path: "order-history", component: OrderHistoryComponent},
	{path: "account-details", component: AccountDetailsComponent},

	//nur eingeloggte user, die Kassenwart oder Admin sind, können diese Routen sehen
	{path: "management/costs", component: AccountingComponent, canActivate: [AuthenticatedGuard, IsTreasurerGuard]},
	{path: "management/stock", component: StockComponent, canActivate: [AuthenticatedGuard, IsTreasurerGuard]},

	{path: "settings", component: SettingsComponent},
	{path: "impressum", component: ImprintComponent},

	{path: "not-allowed", component: UnauthorizedAccessComponent},
	{path: "login", component: LoginComponent},
	{path: "signup", redirectTo: "signup/account-data", pathMatch: "full"},
	{path: "signup/:step", component: SignUpComponent},
	{path: "search", component: SearchResultComponent},
	{path: "cart", component: CheckoutCartComponent},
	{path: "redirect", component: GoogleMapsRedirectComponent}

];
