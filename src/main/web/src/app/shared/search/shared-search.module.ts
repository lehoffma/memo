import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {ResultsContainerComponent} from "./results-container.component";
import {FilteringMenuComponent} from "./filtering-menu/filtering-menu.component";
import {SortingDropdownComponent} from "./sorting-dropdown/sorting-dropdown.component";
import {ReactiveFormsModule} from "@angular/forms";
import {MemoMaterialModule} from "../../../material.module";
import {FilterOptionHeaderComponent} from "./filter-option-header/filter-option-header.component";
import {FilterOptionRowComponent} from "./filter-option-row/filter-option-row.component";
import {FilterSidebarComponent} from "./filtering-menu/filter-sidebar/filter-sidebar.component";
import { FilterDialogComponent } from './filtering-menu/filter-sidebar/filter-dialog.component';
import {LetModule} from "../utility/let/let.module";
import { PaginationComponent } from './pagination/pagination.component';
import {AutocompleteFormsModule} from "../forms/autocomplete/autocomplete-forms.module";
import {RouterModule} from "@angular/router";
import {SearchInputComponent} from "./search-input/search-input.component";

@NgModule({
	imports: [
		CommonModule,
		RouterModule,
		ReactiveFormsModule,
		MemoMaterialModule,
		AutocompleteFormsModule,
		LetModule,
	],
	declarations: [
		ResultsContainerComponent,
		FilteringMenuComponent,
		SortingDropdownComponent,
		FilterOptionHeaderComponent,
		FilterOptionRowComponent,
		FilterSidebarComponent,
		FilterDialogComponent,
		PaginationComponent,
		SearchInputComponent,
	],
	exports: [
		ResultsContainerComponent,
		FilteringMenuComponent,
		SortingDropdownComponent,
		FilterOptionHeaderComponent,
		FilterOptionRowComponent,
		SearchInputComponent,
	],
	entryComponents: [
		FilterDialogComponent
	]
})
export class SharedSearchModule {
}
