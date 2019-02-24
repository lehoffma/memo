import {Route, RouterModule} from "@angular/router";
import {NgModule} from "@angular/core";
import {TourDetailComponent} from "./item-details/details/tour-detail.component";
import {ParticipantListComponent} from "./item-details/participants/participant-list/participant-list.component";
import {PartyDetailComponent} from "./item-details/details/party-detail.component";
import {MerchandiseDetailComponent} from "./item-details/details/merchandise-detail.component";
import {ConcludeEventComponent} from "./conclude/conclude-event/conclude-event.component";
import {ShopItemExistsGuard} from "../../shared/authentication/http-error-handling-guards/shop-item-exists.guard";
import {ShopItemIsVisibleToUserGuard} from "../../shared/authentication/http-error-handling-guards/shop-item-is-visible-to-user.guard";
import {OrderDetailComponent} from "./item-details/details/order-detail.component";
import {WaitingListComponent} from "./waiting-list/waiting-list.component";


const routes: Route[] = [
	{path: "management/orders/:id", component: OrderDetailComponent, canActivate: [ShopItemExistsGuard, ShopItemIsVisibleToUserGuard]},
	{path: "shop/tours/:id", component: TourDetailComponent, canActivate: [ShopItemExistsGuard, ShopItemIsVisibleToUserGuard]},
	{path: "shop/tours/:id/participants", component: ParticipantListComponent, canActivate: [ShopItemExistsGuard, ShopItemIsVisibleToUserGuard]},
	{path: "shop/tours/:id/conclude", component: ConcludeEventComponent, canActivate: [ShopItemExistsGuard, ShopItemIsVisibleToUserGuard]},
	{path: "shop/tours/:id/waiting-list", component: WaitingListComponent, canActivate: [ShopItemExistsGuard, ShopItemIsVisibleToUserGuard]},

	{path: "shop/partys/:id", component: PartyDetailComponent, canActivate: [ShopItemExistsGuard, ShopItemIsVisibleToUserGuard]},
	{
		path: "shop/partys/:id/participants",
		component: ParticipantListComponent,
		canActivate: [ShopItemExistsGuard, ShopItemIsVisibleToUserGuard]
	},
	{path: "shop/partys/:id/conclude", component: ConcludeEventComponent, canActivate: [ShopItemExistsGuard, ShopItemIsVisibleToUserGuard]},
	{path: "shop/partys/:id/waiting-list", component: WaitingListComponent, canActivate: [ShopItemExistsGuard, ShopItemIsVisibleToUserGuard]},

	{path: "shop/merch/:id", component: MerchandiseDetailComponent, canActivate: [ShopItemExistsGuard, ShopItemIsVisibleToUserGuard]},
	{path: "shop/merch/:id/waiting-list", component: WaitingListComponent, canActivate: [ShopItemExistsGuard, ShopItemIsVisibleToUserGuard]},

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
	OrderDetailComponent,
	MerchandiseDetailComponent,
	ConcludeEventComponent,
	WaitingListComponent
];
