import {NgModule} from "@angular/core";
import {Route, RouterModule} from "@angular/router";
import {CartComponent} from "./cart/cart.component";
import {CheckoutComponent} from "./checkout.component";
import {AuthenticatedGuard} from "../../shared/authentication/authenticated.guard";
import {OrderCompleteComponent} from "./order-complete/order-complete.component";
import {CompletedOrderGuard} from "./completed-order.guard";
import {CartIsNotEmptyGuard} from "./cart-is-not-empty.guard";

const routes: Route[] = [
	{path: "cart", component: CartComponent},
	{path: "checkout", component: CheckoutComponent, canActivate: [AuthenticatedGuard, CartIsNotEmptyGuard]},
	{path: "order-complete", component: OrderCompleteComponent, canActivate: [AuthenticatedGuard, CompletedOrderGuard]},
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
	CartComponent, CheckoutComponent,
	OrderCompleteComponent
];
