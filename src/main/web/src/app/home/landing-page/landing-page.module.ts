import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryContainerComponent } from './category-container/category-container.component';
import {ShopModule} from "../../shop/shop.module";
import {RouterModule} from "@angular/router";
import {FlexLayoutModule} from "@angular/flex-layout";
import { ClubInfoGridComponent } from './club-info-grid/club-info-grid.component';
import {MemoMaterialModule} from "../../../material.module";

@NgModule({
	declarations: [CategoryContainerComponent, ClubInfoGridComponent],
	exports: [
		CategoryContainerComponent,
		ClubInfoGridComponent
	],
	imports: [
		CommonModule,
		ShopModule,
		RouterModule,
		FlexLayoutModule,
		MemoMaterialModule
	]
})
export class LandingPageModule { }
