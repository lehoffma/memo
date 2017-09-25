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
import {ShareButtonsModule} from "ngx-sharebuttons";
import {DateAdapter, MATERIAL_COMPATIBILITY_MODE, MD_DATE_FORMATS} from "@angular/material";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {AuthInterceptor} from "./shared/authentication/auth.interceptor";
import {HttpModule} from "@angular/http";
import {ClubManagementModule} from "./club-management/club-management.module";
import {SharedModule} from "./shared/shared.module";
import {UserModule} from "./user/user.module";
import {ShopModule} from "./shop/shop.module";
import {ApiServicesModule} from "./shared/api-services.module";
import {UtilityServicesModule} from "./shared/utility-services.module";
import {AuthenticationModule} from "./shared/authentication.module";
import {MomentDateAdapter, MD_MOMENT_DATE_FORMATS} from "./shared/datepicker-config/moment-adapter";


@NgModule({
	imports: [
		BrowserModule,
		FormsModule,
		HttpModule,
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

		//memo modules
		SharedModule,
		//includes every servlet/api service
		ApiServicesModule.forRoot(),
		//includes other (non-api) services needed throughout the app
		UtilityServicesModule.forRoot(),
		//includes route guards and other authentication stuff
		AuthenticationModule.forRoot(),
		ClubManagementModule,
		ShopModule,
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
		{provide: MATERIAL_COMPATIBILITY_MODE, useValue: true},
		{provide: LOCALE_ID, useValue: "de-DE"},
		{provide: DateAdapter, useClass: MomentDateAdapter},
		{provide: MD_DATE_FORMATS, useValue: MD_MOMENT_DATE_FORMATS},
		{provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
	]
})
export class AppModule {
}
