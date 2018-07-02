import {NgModule} from "@angular/core";
import {ResponsibleUserInputComponent} from "./responsible-user-input/responsible-user-input.component";
import {CommonModule} from "@angular/common";
import {MemoMaterialModule} from "../../../material.module";
import {SharedModule} from "../../shared/shared.module";
import {RouterModule} from "@angular/router";
import {RoutingService} from "./services/routing.service";
import {GMapsService} from "./services/gmaps.service";


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
	providers: [
		RoutingService,
		GMapsService
	],
})
export class SharedShopModule {
}
