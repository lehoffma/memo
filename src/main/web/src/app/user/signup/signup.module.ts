import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SignUpComponent} from "./signup.component";
import {AccountDataFormComponent} from "./account-data-form/account-data-form.component";
import {PaymentMethodsFormComponent} from "./payment-methods-form/payment-methods-form.component";
import {UserDataFormComponent} from "./user-data-form/user-data-form.component";
import {SignUpService} from "./signup.service";
import {MemoMaterialModule} from "../../../material.module";
import {DebitInputFormComponent} from "./payment-methods-form/debit-input-form/debit-input-form.component";
import {RouterModule} from "@angular/router";
import {SharedModule} from "../../shared/shared.module";
import {ShopItemDetailsModule} from "../../shop/shop-item/item-details/shop-item-details.module";
import {SignupCompletedComponent} from "./signup-completed.component";

@NgModule({
	imports: [
		CommonModule,
		RouterModule,
		FormsModule,
		ReactiveFormsModule,
		SharedModule,
		MemoMaterialModule,
		ShopItemDetailsModule,
	],
	declarations: [
		SignUpComponent,
		AccountDataFormComponent,
		DebitInputFormComponent,
		PaymentMethodsFormComponent,
		UserDataFormComponent,
		SignupCompletedComponent,
	],
	providers: [
		SignUpService
	],
	exports: [
		SignUpComponent,
		UserDataFormComponent,
	]
})
export class SignUpModule {
}
