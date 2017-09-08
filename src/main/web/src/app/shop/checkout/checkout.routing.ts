import {NgModule} from "@angular/core";
import {Route, RouterModule} from "@angular/router";
import {CartComponent} from "./cart/cart.component";
import {CheckoutComponent} from "./checkout.component";
import {AuthenticatedGuard} from "../../shared/authentication/authenticated.guard";
import {AddressModificationComponent} from "./address-selection/address-modification/address-modification.component";

const routes: Route[] = [
	{path: "cart", component: CartComponent},
	{path: "checkout", component: CheckoutComponent, canActivate: [AuthenticatedGuard]},
	{path: "members/:id/address", component: AddressModificationComponent, canActivate: [AuthenticatedGuard]},
	{path: "address", component: AddressModificationComponent},

];
@NgModule({
	imports: [RouterModule.forChild(routes)],
	providers: [
		AuthenticatedGuard
	],
	exports: [RouterModule]
})
export class CheckoutRoutingModule {
}

export const routedComponents = [
	CartComponent, CheckoutComponent, AddressModificationComponent
];
