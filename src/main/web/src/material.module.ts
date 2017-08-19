import {NgModule} from "@angular/core";
import {
	MdAutocompleteModule,
	MdButtonModule,
	MdCardModule,
	MdCheckboxModule, MdChipsModule,
	MdDatepickerModule,
	MdDialogModule,
	MdIconModule,
	MdInputModule,
	MdListModule,
	MdMenuModule,
	MdNativeDateModule,
	MdRadioModule,
	MdSelectModule,
	MdSidenavModule,
	MdSnackBarModule,
	MdToolbarModule,
	MdTooltipModule
} from "@angular/material";


@NgModule({
	imports: [MdButtonModule, MdCheckboxModule, MdNativeDateModule, MdDatepickerModule,
		MdMenuModule, MdSidenavModule, MdToolbarModule, MdCardModule,
		MdIconModule, MdDialogModule, MdTooltipModule, MdSnackBarModule,
		MdListModule, MdSelectModule, MdInputModule, MdRadioModule,
		MdAutocompleteModule, MdChipsModule],
	exports: [MdButtonModule, MdCheckboxModule, MdNativeDateModule, MdDatepickerModule,
		MdMenuModule, MdSidenavModule, MdToolbarModule, MdCardModule,
		MdIconModule, MdDialogModule, MdTooltipModule, MdSnackBarModule,
		MdListModule, MdSelectModule, MdInputModule, MdRadioModule,
		MdAutocompleteModule, MdChipsModule],
})
export class MemoMaterialModule {
}
