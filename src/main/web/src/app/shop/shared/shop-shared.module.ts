import {NgModule} from '@angular/core';
import {ResponsibleUserInputComponent} from "./responsible-user-input/responsible-user-input.component";
import {CommonModule} from "@angular/common";
import {MemoMaterialModule} from "../../../material.module";
import {SharedModule} from "../../shared/shared.module";
import {RouterModule} from "@angular/router";


@NgModule({
	imports: [
		CommonModule,
		RouterModule,
		MemoMaterialModule,
		SharedModule
	],
	exports: [
		ResponsibleUserInputComponent
	],
	declarations: [
		ResponsibleUserInputComponent
	],
	providers: [],
})
export class SharedShopModule {
}
