import {LOCALE_ID, NgModule} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {BrowserModule} from "@angular/platform-browser";
import {AppComponent} from "./app.component";
import {RouterModule} from "@angular/router";
import {HomeComponent} from "./home/home.component";
import {ToolbarComponent} from "./home/navigation/toolbar/toolbar.component";
import {CategoryPreviewComponent} from "./home/category-preview/category-preview.component";
import {ToolbarElementComponent} from "./home/navigation/toolbar/element/toolbar-element.component";
import {SideNavComponent} from "./home/navigation/sidenav/sidenav.component";
import {ROUTES} from "./app.routes";
import {memoConfig} from "./app.config";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {ToolbarProfileLinkComponent} from "./home/navigation/toolbar/profile-link/toolbar-profile-link.component";
import {SearchInputComponent} from "./home/navigation/toolbar/search-input/search-input.component";
import {SettingsComponent} from "./home/settings/settings.component";
import {ImprintComponent} from "./home/imprint/imprint.component";
import {AgmCoreModule} from "@agm/core";
import {MemoMaterialModule} from "../material.module";
import {DateAdapter, MAT_DATE_FORMATS, MAT_NATIVE_DATE_FORMATS} from "@angular/material";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {AuthInterceptor} from "./shared/authentication/auth.interceptor";
import {ClubManagementModule} from "./club-management/club-management.module";
import {SharedModule} from "./shared/shared.module";
import {UserModule} from "./user/user.module";
import {ShopModule} from "./shop/shop.module";
import {ApiServicesModule} from "./shared/services/api/api-services.module";
import {UtilityServicesModule} from "./shared/services/utility-services.module";
import {AuthenticationModule} from "./shared/authentication/authentication.module";
import {JwtModule} from "@auth0/angular-jwt";
import {AuthService} from "./shared/authentication/auth.service";

import {registerLocaleData} from "@angular/common";
import localeDe from "@angular/common/locales/de";
import {ShareButtonsModule} from "@ngx-share/buttons";
import {CalendarModule} from "angular-calendar";
import {DateFnsAdapter} from "./util/date-fns-adapter";

registerLocaleData(localeDe);

export function jwtOptionsFactory(tokenService: AuthService) {
	return {
		tokenGetter: () => {
			return tokenService.getToken();
		}
	}
}

export function tokenGetter() {
	if(localStorage.getItem("remember_me") === "true"){
		return localStorage.getItem("auth_token");
	}
	return null;
}

@NgModule({
	imports: [
		BrowserModule,
		FormsModule,
		HttpClientModule,
		ReactiveFormsModule,
		BrowserAnimationsModule,
		MemoMaterialModule,
		RouterModule.forRoot(ROUTES),

		//dependencies
		AgmCoreModule.forRoot({
			apiKey: memoConfig.mapsApiKey,
			libraries: ["places"]
		}),
		ShareButtonsModule.forRoot(),
		CalendarModule.forRoot(),
		JwtModule.forRoot(
			// {
			// 	jwtOptionsProvider: {
			// 		provide: JWT_OPTIONS,
			// 		useFactory: jwtOptionsFactory,
			// 		deps: [AuthService]
			// 	}
			// }
			{
				config: {
					tokenGetter: tokenGetter
				}
			}
		),

		//memo modules
		SharedModule,
		//includes every servlet/api service
		ApiServicesModule.forRoot(),
		//includes other (non-api) services needed throughout the app
		UtilityServicesModule.forRoot(),
		//includes route guards and other authentication stuff
		AuthenticationModule.forRoot(),
		//includes discount service
		ShopModule.forRoot(),
		ClubManagementModule,
		UserModule,
	],
	declarations: [
		AppComponent,

		CategoryPreviewComponent,
		HomeComponent,
		ImprintComponent,

		SearchInputComponent,
		SettingsComponent,
		SideNavComponent,
		ToolbarComponent,
		ToolbarElementComponent,
		ToolbarProfileLinkComponent,
	],
	bootstrap: [
		AppComponent
	],
	providers: [
		{provide: LOCALE_ID, useValue: "de-DE"},
		{provide: DateAdapter, useClass: DateFnsAdapter},
		{provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS},
		{provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true}
	]
})
export class AppModule {
}
