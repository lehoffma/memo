import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SignUpComponent} from "./signup.component";
import {AccountDataFormComponent} from "./account-data-form/account-data-form.component";
import {PaymentMethodsFormComponent} from "./payment-methods-form/payment-methods-form.component";
import {ProfilePictureFormComponent} from "./profile-picture-form/profile-picture-form.component";
import {UserDataFormComponent} from "./user-data-form/user-data-form.component";
import {SignUpService} from "./signup.service";
import {AddressEntryComponent} from "./user-data-form/address-entry.component";
import {MemoMaterialModule} from "../../../material.module";
import {PasswordStrengthBarModule} from "ng2-password-strength-bar";
import {DebitInputFormComponent} from "./payment-methods-form/debit-input-form/debit-input-form.component";
import {RouterModule} from "@angular/router";
import {SharedModule} from "../../shared/shared.module";

@NgModule({
	imports: [
		CommonModule,
		RouterModule,
		FormsModule,
		ReactiveFormsModule,
		PasswordStrengthBarModule,
		SharedModule,
		MemoMaterialModule,
	],
	declarations: [
		SignUpComponent,
		AccountDataFormComponent,
		DebitInputFormComponent,
		PaymentMethodsFormComponent,
		ProfilePictureFormComponent,
		UserDataFormComponent,
		AddressEntryComponent
	],
	providers: [
		SignUpService
	],
	exports: [
		SignUpComponent,
		ProfilePictureFormComponent,
		UserDataFormComponent,
		AddressEntryComponent
	]
})
export class SignUpModule {
}
