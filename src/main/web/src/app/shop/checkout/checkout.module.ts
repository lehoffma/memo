import {NgModule} from "@angular/core";
import {CheckoutRoutingModule, routedComponents} from "./checkout.routing";
import {PaymentComponent} from "./payment/payment.component";
import {CommonModule} from "@angular/common";
import {CartEntryComponent} from "./cart/cart-entry/cart-entry.component";
import {MemoMaterialModule} from "../../../material.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SignUpModule} from "../../user/signup/signup.module";
import {SharedModule} from "../../shared/shared.module";
import {ShopItemDetailsModule} from "../shop-item/item-details/shop-item-details.module";
import {UserModule} from "../../user/user.module";
import {SharedCheckoutModule} from "./shared-checkout.module";
import {RadioSelectionModule} from "../../shared/utility/radio-selection/radio-selection.module";

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
		SignUpModule,
		SharedCheckoutModule,
		RadioSelectionModule
	],
	declarations: [
		routedComponents,
		CartEntryComponent,
		PaymentComponent,
	],
	exports: []
})
export class CheckoutModule {
}
