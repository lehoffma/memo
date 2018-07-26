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
import {SignupCompletedComponent} from "./signup/signup-completed.component";
import {SignupWasJustCompletedGuard} from "../shared/authentication/signup-was-just-completed.guard";
import {ApplyForMembershipComponent} from "./membership/apply-for-membership/apply-for-membership.component";
import {RequestMembershipComponent} from "./membership/request-membership/request-membership.component";
import {ConfirmEmailComponent} from "./confirm-email/confirm-email.component";
import {IsMemberGuard} from "../shared/authentication/is-member.guard";
import {IsOwnProfileGuard} from "../shared/authentication/is-own-profile.guard";

const routes: Route[] = [

	{path: "login", component: LoginComponent, canActivate: [IsNotLoggedInGuard]},
	{path: "signup", redirectTo: "signup/account-data", pathMatch: "full", canActivate: [IsNotLoggedInGuard]},
	{path: "signup/completed", component: SignupCompletedComponent, canActivate: [SignupWasJustCompletedGuard]},
	{path: "signup/:step", component: SignUpComponent, canActivate: [IsNotLoggedInGuard]},
	{path: "forgot-password", component: PasswordRecoveryComponent, canActivate: [IsNotLoggedInGuard]},
	{path: "password-reset", component: PasswordRecoveryLandingPageComponent, canActivate: [IsNotLoggedInGuard]},
	{path: "confirm-email", component: ConfirmEmailComponent, canActivate: [IsNotLoggedInGuard]},
	//todo isNotAlreadyMemberGuard
	{path: "applyForMembership", component: ApplyForMembershipComponent, canActivate: [AuthenticatedGuard]},
	{path: "requestMembership", component: RequestMembershipComponent, canActivate: [AuthenticatedGuard]},
	{path: "members/:id", component: ProfileComponent, canActivate: [AuthenticatedGuard, IsOwnProfileGuard]},
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
	OrderHistoryComponent,
	PasswordRecoveryLandingPageComponent,
	ApplyForMembershipComponent,
	RequestMembershipComponent,
];
