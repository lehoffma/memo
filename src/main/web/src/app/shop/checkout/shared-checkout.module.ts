import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {MemoMaterialModule} from "../../../material.module";
import {CartTourParticipantComponent} from "./cart/cart-entry/cart-tour-participant/cart-tour-participant.component";
import {FormsModule} from "@angular/forms";

@NgModule({
	declarations: [
		CartTourParticipantComponent
	],
	imports: [
		CommonModule,
		MemoMaterialModule,
		FormsModule
	],
	exports: [
		CartTourParticipantComponent
	]
})
export class SharedCheckoutModule {
}
