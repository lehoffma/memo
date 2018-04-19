import {NgModule} from "@angular/core";
import {CheckoutRoutingModule, routedComponents} from "./checkout.routing";
import {PaymentMethodSelectionComponent} from "./payment/payment-method-selection.component";
import {PaymentComponent} from "./payment/payment.component";
import {CommonModule} from "@angular/common";
import {CartEntryComponent} from "./cart/cart-entry/cart-entry.component";
import {MemoMaterialModule} from "../../../material.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SignUpModule} from "../../user/signup/signup.module";
import {CartTourParticipantComponent} from "./cart/cart-entry/cart-tour-participant/cart-tour-participant.component";
import {SharedModule} from "../../shared/shared.module";
import {ShopItemDetailsModule} from "../shop-item/item-details/shop-item-details.module";
import {UserModule} from "../../user/user.module";

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		MemoMaterialModule,
		UserModule,
		CheckoutRoutingModule,
		ShopItemDetailsModule,
		SharedModule,
		SignUpModule
	],
	declarations: [
		routedComponents,
		CartEntryComponent,
		PaymentMethodSelectionComponent,
		PaymentComponent,
		CartTourParticipantComponent
	]
})
export class CheckoutModule {
}
