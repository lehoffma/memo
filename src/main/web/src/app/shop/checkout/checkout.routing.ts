import {NgModule} from "@angular/core";
import {Route, RouterModule} from "@angular/router";
import {CartComponent} from "./cart/cart.component";
import {CheckoutComponent} from "./checkout.component";
import {AuthenticatedGuard} from "../../shared/authentication/authenticated.guard";
import {AddressModificationComponent} from "./address-selection/address-modification/address-modification.component";
import {OrderCompleteComponent} from "./order-complete/order-complete.component";
import {CompletedOrderGuard} from "./completed-order.guard";
import {CartIsNotEmptyGuard} from "./cart-is-not-empty.guard";

const routes: Route[] = [
	{path: "cart", component: CartComponent},
	{path: "checkout", component: CheckoutComponent, canActivate: [AuthenticatedGuard, CartIsNotEmptyGuard]},
	{path: "order-complete", component: OrderCompleteComponent, canActivate: [AuthenticatedGuard, CompletedOrderGuard]},
	{path: "members/:id/address", component: AddressModificationComponent, canActivate: [AuthenticatedGuard]},
	{path: "address", component: AddressModificationComponent},

];

@NgModule({
	imports: [
		RouterModule.forChild(routes)
	],
	providers: [
		AuthenticatedGuard,
		CompletedOrderGuard,
		CartIsNotEmptyGuard
	],
	exports: [RouterModule]
})
export class CheckoutRoutingModule {
}

export const routedComponents = [
	CartComponent, CheckoutComponent, AddressModificationComponent, OrderCompleteComponent
];
