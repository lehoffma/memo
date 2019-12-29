import {ErrorHandler, LOCALE_ID, NgModule} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {BrowserModule} from "@angular/platform-browser";
import {AppComponent} from "./app.component";
import {RouterModule} from "@angular/router";
import {HomeComponent} from "./home/home.component";
import {ToolbarComponent} from "./home/navigation/toolbar/toolbar.component";
import {ToolbarElementComponent} from "./home/navigation/toolbar/element/toolbar-element.component";
import {SideNavComponent} from "./home/navigation/sidenav/sidenav.component";
import {ROUTES} from "./app.routes";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {ToolbarProfileLinkComponent} from "./home/navigation/toolbar/profile-link/toolbar-profile-link.component";
import {ImpressumComponent} from "./club/impressum/impressum.component";
import {AgmCoreModule, MapsAPILoader} from "@agm/core";
import {MemoMaterialModule} from "../material.module";
import {DateAdapter, MAT_DATE_FORMATS, MAT_NATIVE_DATE_FORMATS} from "@angular/material/core";
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

import {FaIconLibrary, FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {adapterFactory} from "angular-calendar/date-adapters/date-fns";
import {FlexLayoutModule} from "@angular/flex-layout";
import {ProgressiveImageLoadingModule} from "./shared/progressive-image-loading/progressive-image-loading.module";
import {ClubModule} from "./club/club.module";
import {faCheck, faCubes, faEnvelope, faFire, faGlobe, faLink, fas, faTshirt} from "@fortawesome/free-solid-svg-icons";
import {MatPaginatorIntl} from "@angular/material";
import {MatPaginatorIntlDe} from "./shared/i18n/mat-paginator-intl.de";
import {LandingPageModule} from "./home/landing-page/landing-page.module";
import {CustomMapsApiLoaderService} from "./util/custom-maps-api-loader.service";
import {faFacebook, faFacebookF, faFacebookMessenger, faTelegramPlane, faTwitter, faWhatsapp} from "@fortawesome/free-brands-svg-icons";
import {SentryErrorHandlerService} from "./util/sentry-error-handler.service";

import * as Sentry from '@sentry/browser';
import {GlobalErrorHandlerService} from "./shared/utility/error-handling/global-error-handler.service";


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
	faWhatsapp, faFacebookMessenger, faTelegramPlane, faLink,
	faFire, faCubes, faTshirt, faCheck,
];


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
		AgmCoreModule.forRoot(),
		ShareButtonsModule,
		CalendarModule.forRoot({
			provide: calendarAdapter,
			useFactory: adapterFactory
		}),
		FontAwesomeModule,
		MatPasswordStrengthModule.forRoot(),
		FlexLayoutModule,
		NgProgressModule,
		NgProgressHttpModule,

		//memo modules
		SharedModule,
		ProgressiveImageLoadingModule,
		//includes every servlet/api service
		ApiServicesModule.forRoot(),
		//includes other (non-api) services needed throughout the app
		UtilityServicesModule.forRoot(),
		//includes route guards and other authentication stuff
		AuthenticationModule.forRoot(),
		//includes discount service
		ShopModule.forRoot(),
		ClubModule,
		ClubManagementModule,
		UserModule,
		LandingPageModule,
	],
	declarations: [
		AppComponent,

		HomeComponent,
		ImpressumComponent,

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
		{provide: MatPaginatorIntl, useClass: MatPaginatorIntlDe},
		{provide: LOCALE_ID, useValue: "de-DE"},
		{provide: DateAdapter, useClass: DateFnsAdapter},
		{provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS},
		{provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
		{provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true},
		{provide: MapsAPILoader, useClass: CustomMapsApiLoaderService},
		{provide: ErrorHandler, useClass: SentryErrorHandlerService}
	]
})
export class AppModule {
	constructor(private library: FaIconLibrary) {
		library.addIconPacks(fas);
		library.addIcons(...shareButtonsIcons);
	}
}
