import {MerchDetailComponent} from "./merchandise/merchandise-detail/merchandise-detail.component";
import {AccountProfileComponent} from "./account/profile/account-profile.component";
import {PartysComponent} from "./partys/partys.component";
import {AccountComponent} from "./account/account.component";
import {TourDetailComponent} from "./tours/tours-detail/tours-detail.component";
import {ToursComponent} from "./tours/tours.component";
import {OverViewComponent} from "./overview/overview.component";
import {PartyDetailComponent} from "./partys/party-detail/party-detail.component";
import {GoogleMapsRedirectComponent} from "./shared/google-maps-redirect/google-maps-redirect.component";
export const ROUTES = [
    {path: "", component: OverViewComponent},
    {path: "tours", component: ToursComponent},
    {path: "tours/:id", component: TourDetailComponent},
    {path: "account", component: AccountComponent},
    {path: "partys", component: PartysComponent},
    {path: "partys/:id", component: PartyDetailComponent},
    {path: "members/:id", component: AccountProfileComponent},
    {path: "merch/:id", component: MerchDetailComponent},
    {path: "redirect", component: GoogleMapsRedirectComponent}
];