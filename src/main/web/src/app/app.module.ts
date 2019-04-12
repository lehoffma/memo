import {LOCALE_ID, NgModule} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {BrowserModule} from "@angular/platform-browser";
import {AppComponent} from "./app.component";
import {RouterModule} from "@angular/router";
import {HomeComponent} from "./home/home.component";
import {ToolbarComponent} from "./home/navigation/toolbar/toolbar.component";
import {ToolbarElementComponent} from "./home/navigation/toolbar/element/toolbar-element.component";
import {SideNavComponent} from "./home/navigation/sidenav/sidenav.component";
import {ROUTES} from "./app.routes";
import {memoConfig} from "./app.config";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {ToolbarProfileLinkComponent} from "./home/navigation/toolbar/profile-link/toolbar-profile-link.component";
import {SearchInputComponent} from "./home/navigation/toolbar/search-input/search-input.component";
import {ImpressumComponent} from "./home/impressum/impressum.component";
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

import {registerLocaleData} from "@angular/common";
import localeDe from "@angular/common/locales/de";
import {ShareButtonsModule} from "@ngx-share/buttons";
import {CalendarModule, DateAdapter as calendarAdapter} from "angular-calendar";
import {DateFnsAdapter} from "./util/date-fns-adapter";
import {UnauthorizedHttpClient} from "./shared/authentication/unauthorized-http-client.service";
import {ErrorInterceptor} from "./shared/utility/error-handling/error.interceptor";
import {MatPasswordStrengthModule} from "@angular-material-extensions/password-strength";
import {FooterComponent} from "./home/footer/footer.component";
import {NgProgressHttpModule} from "@ngx-progressbar/http";
import {NgProgressModule} from "@ngx-progressbar/core";
import {SectionsComponent} from "./home/footer/sections.component";
import {NgcCookieConsentConfig, NgcCookieConsentModule} from "ngx-cookieconsent";
import {library} from "@fortawesome/fontawesome-svg-core";

import {faFacebookF} from "@fortawesome/free-brands-svg-icons/faFacebookF";
import {faTwitter} from "@fortawesome/free-brands-svg-icons/faTwitter";
import {faWhatsapp} from "@fortawesome/free-brands-svg-icons/faWhatsapp";
import {faFacebookMessenger} from "@fortawesome/free-brands-svg-icons/faFacebookMessenger";
import {faTelegramPlane} from "@fortawesome/free-brands-svg-icons/faTelegramPlane";

import {faLink} from "@fortawesome/free-solid-svg-icons/faLink";
import {faFacebook} from "@fortawesome/free-brands-svg-icons/faFacebook";
import {faEnvelope} from "@fortawesome/free-solid-svg-icons/faEnvelope";
import {faGlobe} from "@fortawesome/free-solid-svg-icons/faGlobe";
import {adapterFactory} from "angular-calendar/date-adapters/date-fns";
import {FlexLayoutModule} from "@angular/flex-layout";

const cookieConfig: NgcCookieConsentConfig = {
	"cookie": {
		"domain": ".meilenwoelfe.de"
	},
	"position": "bottom",
	"theme": "edgeless",
	"palette": {
		"popup": {
			"background": "#000000",
			"text": "#ffffff",
			"link": "#ffffff"
		},
		"button": {
			"background": "#1565c0",
			"text": "#ffffff",
			"border": "transparent"
		}
	},
	"type": "opt-in",
	"content": {
		"message": "Diese Webseite verwendet Cookies, um die bestmögliche Erfahrung zu gewährleisten.",
		"dismiss": "Verstanden!",
		"deny": "Verbieten",
		"allow": "Erlauben",
		"link": "Mehr Infos",
		"href": "https://cookiesandyou.com"
	}
};

const shareButtonsIcons = [
	faFacebookF, faTwitter, faFacebook, faEnvelope, faGlobe,
	faWhatsapp, faFacebookMessenger, faTelegramPlane, faLink
];

library.add(...shareButtonsIcons);


registerLocaleData(localeDe);

@NgModule({
	imports: [
		//universal/ssr
		// BrowserModule.withServerTransition({appId: "my-app"}),
		BrowserModule,
		FormsModule,
		HttpClientModule,
		ReactiveFormsModule,
		BrowserAnimationsModule,
		MemoMaterialModule,
		//universal/ssr
		// RouterModule.forRoot(ROUTES, {initialNavigation: "enabled"}),
		RouterModule.forRoot(ROUTES),

		//universal/ssr
		// TransferHttpCacheModule,

		//dependencies
		NgcCookieConsentModule.forRoot(cookieConfig),
		AgmCoreModule.forRoot({
			apiKey: memoConfig.mapsApiKey,
			libraries: ["places"]
		}),
		ShareButtonsModule.forRoot(),
		CalendarModule.forRoot({
			provide: calendarAdapter,
			useFactory: adapterFactory
		}),
		MatPasswordStrengthModule.forRoot(),
		FlexLayoutModule,
		NgProgressModule.forRoot(),
		NgProgressHttpModule.forRoot(),

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

		HomeComponent,
		ImpressumComponent,

		SearchInputComponent,
		SideNavComponent,
		ToolbarComponent,
		ToolbarElementComponent,
		ToolbarProfileLinkComponent,
		FooterComponent,
		SectionsComponent,
	],
	bootstrap: [
		AppComponent
	],
	providers: [
		UnauthorizedHttpClient,
		{provide: LOCALE_ID, useValue: "de-DE"},
		{provide: DateAdapter, useClass: DateFnsAdapter},
		{provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS},
		{provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
		{provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true}
	]
})
export class AppModule {
}
