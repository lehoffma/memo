import {NgModule} from "@angular/core";
import {FormsModule} from "@angular/forms";
import {BrowserModule} from "@angular/platform-browser";
import {AppComponent} from "./app.component";
import {RouterModule} from "@angular/router";
import {OverViewComponent} from "./overview/overview.component";
import {MaterialModule} from "@angular/material";
import {NavigationComponent} from "./navigation/toolbar/navigation-toolbar.component";
import {OverViewPreviewComponent} from "./overview/preview/overview-preview.component";
import {ToursComponent} from "./tours/tours.component";
import {AccountComponent} from "./account/account.component";
import {PartysComponent} from "./partys/partys.component";
import {PartyStore} from "./shared/stores/party.store";
import {AccountProfileComponent} from "./account/profile/account-profile.component";
import {TourDetailComponent} from "./tours/tours-detail/tours-detail.component";
import {NavigationService} from "./shared/services/navigation.service";
import {NavigationElementComponent} from "./navigation/toolbar/element/navigation-toolbar-element.component";
import {NavigationSideNavComponent} from "./navigation/sidenav/navigation-sidenav.component";
import {UserStore} from "./shared/stores/user.store";
import {MerchStore} from "./shared/stores/merch.store";
import {TourStore} from "./shared/stores/tour.store";
import {PartyDetailComponent} from "./partys/party-detail/party-detail.component";
import {MerchDetailComponent} from "./merchandise/merchandise-detail/merchandise-detail.component";
import {AddressStore} from "./shared/stores/adress.store";
import {ClothesSizePipe} from "./merchandise/merchandise-detail/clothes-size.pipe";
import {AgmCoreModule} from "angular2-google-maps/core";
import {ROUTES} from "./app.routes";
import {GoogleMapsRedirectComponent} from "./shared/google-maps-redirect/google-maps-redirect.component";
import {MerchComponent} from "./merchandise/merchandise.component";

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        MaterialModule.forRoot(),
        RouterModule.forRoot(ROUTES),
        AgmCoreModule.forRoot({
            apiKey: "AIzaSyBu1f0LaP7haUohKDfHzqq9nO0ardgP3UE"
        })
    ],
    declarations: [
        AppComponent,
        GoogleMapsRedirectComponent,
        ClothesSizePipe,
        NavigationSideNavComponent,
        NavigationComponent,
        NavigationElementComponent,
        OverViewComponent,
        OverViewPreviewComponent,
        ToursComponent,
        TourDetailComponent,
        AccountComponent,
        PartysComponent,
        PartyDetailComponent,
        MerchComponent,
        MerchDetailComponent,
        AccountProfileComponent
    ],
    bootstrap: [
        AppComponent
    ],
    providers: [NavigationService, AddressStore, PartyStore, MerchStore, TourStore, UserStore]
})
export class AppModule {
}