import {Route, RouterModule} from "@angular/router";
import {NgModule} from "@angular/core";
import {LoginComponent} from "./login/login.component";
import {SignUpComponent} from "./signup/signup.component";
import {ProfileComponent} from "./profile/profile.component";
import {MyToursComponent} from "./my-tours/my-tours.component";
import {OrderHistoryComponent} from "./order-history/order-history.component";
import {AuthenticatedGuard} from "../shared/authentication/authenticated.guard";
import {UnauthorizedAccessComponent} from "./unauthorized-access/unauthorized-access.component";
import {PasswordRecoveryComponent} from "./password-recovery/password-recovery.component";
import {IsNotLoggedInGuard} from "../shared/authentication/is-not-logged-in.guard";
import {PasswordRecoveryLandingPageComponent} from "./password-recovery/password-recovery-landing-page.component";

const routes: Route[] = [

	{path: "login", component: LoginComponent, canActivate: [IsNotLoggedInGuard]},
	{path: "signup", redirectTo: "signup/account-data", pathMatch: "full", canActivate: [IsNotLoggedInGuard]},
	{path: "signup/:step", component: SignUpComponent, canActivate: [IsNotLoggedInGuard]},
	{path: "forgot-password", component: PasswordRecoveryComponent, canActivate: [IsNotLoggedInGuard]},
	{path: "password-reset", component: PasswordRecoveryLandingPageComponent, canActivate: [IsNotLoggedInGuard]},
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

export const routedComponents = [
	UnauthorizedAccessComponent,
	PasswordRecoveryComponent,
	LoginComponent,
	ProfileComponent,
	MyToursComponent,
	OrderHistoryComponent
];
