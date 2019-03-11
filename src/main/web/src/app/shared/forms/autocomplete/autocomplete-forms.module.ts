import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {EventAutocompleteComponent} from "./event-autocomplete/event-autocomplete.component";
import {UserAutocompleteComponent} from "./user-autocomplete/user-autocomplete.component";
import {ReactiveFormsModule} from "@angular/forms";
import {MemoMaterialModule} from "../../../../material.module";
import {RouterModule} from "@angular/router";

@NgModule({
	imports: [
		CommonModule,
		RouterModule,
		ReactiveFormsModule,
		MemoMaterialModule,
	],
	declarations: [
		EventAutocompleteComponent,
		UserAutocompleteComponent,
	],
	exports: [
		EventAutocompleteComponent,
		UserAutocompleteComponent,
	]
})
export class AutocompleteFormsModule {
}
