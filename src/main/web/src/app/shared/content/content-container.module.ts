import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {ContentContainerComponent, SimpleContentContainerComponent} from "./content-container.component";
import {MemoMaterialModule} from "../../../material.module";
import {RouterModule} from "@angular/router";

@NgModule({
	declarations: [ContentContainerComponent, SimpleContentContainerComponent],
	imports: [
		CommonModule,
		MemoMaterialModule,
		RouterModule,
	],
	exports: [ContentContainerComponent, SimpleContentContainerComponent]
})
export class ContentContainerModule {
}
