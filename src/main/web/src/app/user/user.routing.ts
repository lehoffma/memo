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
import {IsOwnProfileGuard} from "../shared/authentication/is-own-profile.guard";
import {NotificationOverviewComponent} from "./notifications/notification-overview.component";
import {UserSettingsComponent} from "./user-settings/user-settings.component";
import {PersonalDataWrapperComponent} from "./user-settings/subsections/personal-data-wrapper/personal-data-wrapper.component";
import {ProfilePictureWrapperComponent} from "./user-settings/subsections/profile-picture-wrapper/profile-picture-wrapper.component";
import {AddressesWrapperComponent} from "./user-settings/subsections/addresses-wrapper/addresses-wrapper.component";
import {AccountDataWrapperComponent} from "./user-settings/subsections/account-data-wrapper/account-data-wrapper.component";
import {ClubInformationWrapperComponent} from "./user-settings/subsections/club-information-wrapper/club-information-wrapper.component";
import {NotificationSettingsComponent} from "./user-settings/subsections/notification-settings/notification-settings.component";
import {PaymentSettingsComponent} from "./user-settings/subsections/payment-settings/payment-settings.component";

//todo put stuff that isnt under user/ into separate package
const routes: Route[] = [

	{path: "login", component: LoginComponent, canActivate: [IsNotLoggedInGuard]},
	{path: "signup", redirectTo: "signup/account-data", pathMatch: "full", canActivate: [IsNotLoggedInGuard]},
	{path: "signup/completed", component: SignupCompletedComponent, canActivate: [SignupWasJustCompletedGuard]},
	{path: "signup/:step", component: SignUpComponent, canActivate: [IsNotLoggedInGuard]},
	{path: "forgot-password", component: PasswordRecoveryComponent, canActivate: [IsNotLoggedInGuard]},
	{path: "password-reset", component: PasswordRecoveryLandingPageComponent, canActivate: [IsNotLoggedInGuard]},
	{path: "confirm-email", component: ConfirmEmailComponent, canActivate: [IsNotLoggedInGuard]},
	//todo isNotAlreadyMemberGuard
	{path: "membership/apply", component: ApplyForMembershipComponent, canActivate: [AuthenticatedGuard]},
	{path: "membership/change", component: RequestMembershipComponent, canActivate: [AuthenticatedGuard]},
	{path: "notifications", component: NotificationOverviewComponent, canActivate: [AuthenticatedGuard]},
	{path: "club/members/:id", component: ProfileComponent, canActivate: [AuthenticatedGuard, IsOwnProfileGuard]},
	{path: "user/events", component: MyToursComponent, canActivate: [AuthenticatedGuard]},
	{path: "user/order-history", component: OrderHistoryComponent, canActivate: [AuthenticatedGuard]},
	{path: "not-allowed", component: UnauthorizedAccessComponent},

	{
		path: "user/account-settings",
		component: UserSettingsComponent,
		children: [
			{path: "", redirectTo: "personal-data", pathMatch: "full"},
			{path: "personal-data", component: PersonalDataWrapperComponent,},
			{path: "profile-picture", component: ProfilePictureWrapperComponent,},
			{path: "addresses", component: AddressesWrapperComponent,},
			{path: "account", component: AccountDataWrapperComponent,},
			{path: "payment", component: PaymentSettingsComponent},
			{path: "club", component: ClubInformationWrapperComponent,},
			{path: "notifications", component: NotificationSettingsComponent,},
		],
		canActivate: [AuthenticatedGuard]
	},
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
	NotificationOverviewComponent,
	UserSettingsComponent
];
