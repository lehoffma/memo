import {NgModule} from "@angular/core";
import {routedComponents, SearchRoutingModule} from "./search.routing";
import {ResultsComponent} from "./results/results.component";
import {ResultsEntryComponent} from "./results/results-entry/results-entry.component";
import {CommonModule} from "@angular/common";
import {MemoMaterialModule} from "../../../material.module";
import {SharedSearchModule} from "../../shared/search/shared-search.module";
import {SharedModule} from "../../shared/shared.module";
import {FilterOptionBuilder} from "../../shared/search/filter-option-builder.service";

@NgModule({
	imports: [
		CommonModule,
		MemoMaterialModule,
		SharedSearchModule,
		SharedModule,
		SearchRoutingModule,
	],
	declarations: [
		routedComponents,
		ResultsComponent,
		ResultsEntryComponent,
	],
	providers: [
		FilterOptionBuilder
	],
	exports: [
		ResultsComponent,
		ResultsEntryComponent,
	]
})
export class SearchModule {
}

