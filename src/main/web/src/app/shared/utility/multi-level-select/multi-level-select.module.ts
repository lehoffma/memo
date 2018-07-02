import {NgModule} from "@angular/core";
import {MultiLevelSelectComponent} from "./multi-level-select.component";
import {MultiLevelSelectEntryComponent} from "./multi-level-select-entry/multi-level-select-entry.component";
import {MemoMaterialModule} from "../../../../material.module";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		MemoMaterialModule
	],
	declarations: [
		MultiLevelSelectComponent,
		MultiLevelSelectEntryComponent
	],
	exports: [
		MultiLevelSelectComponent
	]
})
export class MultiLevelSelectModule {
}
