import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {DiscountsComponent} from "./discounts.component";
import {DiscountFormComponent} from "./discount-form/discount-form.component";
import {DiscountGridItemComponent} from "./discount-grid-item/discount-grid-item.component";
import {SharedSearchModule} from "../../shared/search/shared-search.module";
import {LetModule} from "../../shared/utility/let/let.module";
import {MemoMaterialModule} from "../../../material.module";
import {RouterModule} from "@angular/router";
import {SharedPipesModule} from "../../shared/pipes/shared-pipes.module";
import {FlexLayoutModule} from "@angular/flex-layout";

@NgModule({
	declarations: [DiscountsComponent, DiscountFormComponent, DiscountGridItemComponent],
	imports: [
		CommonModule,
		SharedSearchModule,
		LetModule,
		MemoMaterialModule,
		RouterModule,
		SharedPipesModule,
		FlexLayoutModule
	],
	exports: [
		DiscountsComponent,
		DiscountFormComponent,
	]
})
export class DiscountsModule {
}
