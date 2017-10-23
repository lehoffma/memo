import {NgModule} from "@angular/core";
import {CheckoutRoutingModule, routedComponents} from "./checkout.routing";
import {PaymentMethodSelectionComponent} from "./payment/payment-method-selection.component";
import {PaymentComponent} from "./payment/payment.component";
import {AddressSelectionComponent} from "./address-selection/address-selection.component";
import {CommonModule} from "@angular/common";
import {CartEntryComponent} from "./cart/cart-entry/cart-entry.component";
import {MemoMaterialModule} from "../../../material.module";
import {FormsModule} from "@angular/forms";
import {SignUpModule} from "../../user/signup/signup.module";

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		MemoMaterialModule,
		CheckoutRoutingModule,
		SignUpModule
	],
	declarations: [
		routedComponents,
		CartEntryComponent,
		PaymentMethodSelectionComponent,
		PaymentComponent,
		AddressSelectionComponent
	]
})
export class CheckoutModule{}
