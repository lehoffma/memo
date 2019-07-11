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
import {ContentContainerModule} from "../../shared/content/content-container.module";
import {ReactiveFormsModule} from "@angular/forms";
import { DiscountConditionFormComponent } from './discount-form/discount-condition-form/discount-condition-form.component';
import {DataContainerModule} from "../../shared/utility/data-container/data-container.module";

@NgModule({
	declarations: [DiscountsComponent, DiscountFormComponent, DiscountGridItemComponent, DiscountConditionFormComponent],
	imports: [
		CommonModule,
		SharedSearchModule,
		LetModule,
		MemoMaterialModule,
		RouterModule,
		SharedPipesModule,
		FlexLayoutModule,
		ContentContainerModule,
		ReactiveFormsModule,
		DataContainerModule
	],
	exports: [
		DiscountsComponent,
		DiscountFormComponent,
	]
})
export class DiscountsModule {
}
