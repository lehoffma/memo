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
export const ROUTES = [
	{path: "", component: HomeComponent},
	{path: "tours", component: ToursComponent},
	{path: "tours/:id", component: TourDetailComponent},
	{path: "account", component: AccountComponent},
	{path: "partys", component: PartysComponent},
	{path: "partys/:id", component: PartyDetailComponent},
	{path: "members/:id", component: ProfileComponent},
	{path: "merch/:id", component: MerchandiseDetailComponent},
	{path: "login", component: LoginComponent},
	{path: "signup", redirectTo: "signup/account-data", pathMatch: "full"},
	{path: "signup/:step", component: SignUpComponent},
	{path: "search", component: SearchResultComponent},
	{path: "cart", component: CheckoutCartComponent},
	{path: "redirect", component: GoogleMapsRedirectComponent}


];
