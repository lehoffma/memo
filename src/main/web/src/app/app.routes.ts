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
export const ROUTES = [
	{path: "", component: HomeComponent},
	{path: "tours", component: ToursComponent},
	{path: "tours/:id", component: TourDetailComponent},
	{path: "account", component: AccountComponent},
	{path: "partys", component: PartysComponent},
	{path: "partys/:id", component: PartyDetailComponent},
	{path: "members", component: MemberListComponent},
	{path: "members/:id", component: ProfileComponent},
	{path: "my-events", component: MyToursComponent},
	{path: "order-history", component: OrderHistoryComponent},
	{path: "account-details", component: AccountDetailsComponent},
	{path: "merch/:id", component: MerchandiseDetailComponent},

	{path: "management/costs", component: AccountingComponent},
	{path: "management/stock", component: StockComponent},

	{path: "settings", component: SettingsComponent},
	{path: "impressum", component: ImprintComponent},

	{path: "login", component: LoginComponent},
	{path: "signup", redirectTo: "signup/account-data", pathMatch: "full"},
	{path: "signup/:step", component: SignUpComponent},
	{path: "search", component: SearchResultComponent},
	{path: "cart", component: CheckoutCartComponent},
	{path: "redirect", component: GoogleMapsRedirectComponent}

];
