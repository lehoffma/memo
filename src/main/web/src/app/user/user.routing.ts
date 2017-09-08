import {Route, RouterModule} from "@angular/router";
import {NgModule} from "@angular/core";
import {LoginComponent} from "./login/login.component";
import {SignUpComponent} from "./signup/signup.component";
import {ProfileComponent} from "./profile/profile.component";
import {MyToursComponent} from "./my-tours/my-tours.component";
import {OrderHistoryComponent} from "./order-history/order-history.component";
import {AuthenticatedGuard} from "../shared/authentication/authenticated.guard";
import {UnauthorizedAccessComponent} from "./unauthorized-access/unauthorized-access.component";

const routes: Route[] = [

	{path: "login", component: LoginComponent},
	{path: "signup", redirectTo: "signup/account-data", pathMatch: "full"},
	{path: "signup/:step", component: SignUpComponent},
	{path: "members/:id", component: ProfileComponent},
	//nur eingeloggte User können diese Routen sehen
	{path: "my-events", component: MyToursComponent, canActivate: [AuthenticatedGuard]},
	{path: "order-history", component: OrderHistoryComponent, canActivate: [AuthenticatedGuard]},
	{path: "not-allowed", component: UnauthorizedAccessComponent},

];


@NgModule({
	imports: [
		RouterModule.forChild(routes)
	],
	exports: [RouterModule]
})
export class UserRoutingModule {
}

export const routedComponents = [UnauthorizedAccessComponent, LoginComponent, ProfileComponent, MyToursComponent, OrderHistoryComponent];
