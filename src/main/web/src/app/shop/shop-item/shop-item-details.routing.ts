import {Route, RouterModule} from "@angular/router";
import {NgModule} from "@angular/core";
import {TourDetailComponent} from "./item-details/details/tour-detail.component";
import {ParticipantListComponent} from "./item-details/participants/participant-list/participant-list.component";
import {PartyDetailComponent} from "./item-details/details/party-detail.component";
import {MerchandiseDetailComponent} from "./item-details/details/merchandise-detail.component";
import {ConcludeEventComponent} from "./conclude/conclude-event/conclude-event.component";
import {SharedModule} from "../../shared/shared.module";

const routes: Route[] = [
	{path: "tours/:id", component: TourDetailComponent},
	{path: "tours/:id/participants", component: ParticipantListComponent},
	{path: "tours/:id/conclude", component: ConcludeEventComponent},

	{path: "partys/:id", component: PartyDetailComponent},
	{path: "partys/:id/participants", component: ParticipantListComponent},
	{path: "partys/:id/conclude", component: ConcludeEventComponent},

	{path: "merch/:id", component: MerchandiseDetailComponent},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ShopItemDetailsRoutingModule {
}

export const routedComponents = [
	TourDetailComponent,
	ParticipantListComponent,
	PartyDetailComponent,
	MerchandiseDetailComponent,
	ConcludeEventComponent
];
