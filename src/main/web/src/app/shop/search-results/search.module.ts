import {NgModule} from "@angular/core";
import {routedComponents, SearchRoutingModule} from "./search.routing";
import {FilteringMenuComponent} from "./filtering-menu/filtering-menu.component";
import {ResultsComponent} from "./results/results.component";
import {ResultsEntryComponent} from "./results/results-entry/results-entry.component";
import {SortingDropdownComponent} from "./sorting-dropdown/sorting-dropdown.component";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {MemoMaterialModule} from "../../../material.module";
import {SharedModule} from "../../shared/shared.module";
import {SearchFilterService} from "./search-filter.service";
import {FilterOptionBuilder} from "./filter-option-builder.service";
import {FilterOptionFactoryService} from "./filter-option-factory.service";

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		MemoMaterialModule,
		SharedModule,
		SearchRoutingModule,
	],
	declarations: [
		routedComponents,
		FilteringMenuComponent,
		ResultsComponent,
		ResultsEntryComponent,
		SortingDropdownComponent
	],
	providers: [
		SearchFilterService,
		FilterOptionBuilder,
		FilterOptionFactoryService
	],
	exports: [
		SortingDropdownComponent,
		FilteringMenuComponent,
		ResultsComponent,
		ResultsEntryComponent,
	]
})
export class SearchModule {
}

