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

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        MaterialModule.forRoot(),
        RouterModule.forRoot([
            {path: "", component: OverViewComponent},
            {path: "tours", component: ToursComponent},
            {path: "tours/:id", component: TourDetailComponent},
            {path: "account", component: AccountComponent},
            {path: "partys", component: PartysComponent},
            {path: "partys/:id", component: PartyDetailComponent},
            {path: "members/:id", component: AccountProfileComponent}
        ])
    ],
    declarations: [
        AppComponent,
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
        AccountProfileComponent
    ],
    bootstrap: [
        AppComponent
    ],
    providers: [NavigationService, PartyStore, MerchStore, TourStore, UserStore]
})
export class AppModule {
}