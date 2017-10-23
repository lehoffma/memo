import {NgModule} from "@angular/core";
import {
	MdAutocompleteModule,
	MdButtonModule,
	MdButtonToggleModule,
	MdCardModule,
	MdCheckboxModule,
	MdChipsModule,
	MdDatepickerModule,
	MdDialogModule,
	MdIconModule,
	MdInputModule,
	MdListModule,
	MdMenuModule,
	MdNativeDateModule,
	MdProgressSpinnerModule,
	MdRadioModule,
	MdSelectModule,
	MdSidenavModule,
	MdSnackBarModule,
	MdStepperModule,
	MdTabsModule,
	MdToolbarModule,
	MdTooltipModule,
} from "@angular/material";

const modules = [MdButtonModule, MdCheckboxModule, MdNativeDateModule, MdDatepickerModule,
	MdMenuModule, MdSidenavModule, MdToolbarModule, MdCardModule,
	MdIconModule, MdDialogModule, MdTooltipModule, MdSnackBarModule,
	MdListModule, MdSelectModule, MdInputModule, MdRadioModule,
	MdAutocompleteModule, MdChipsModule, MdProgressSpinnerModule,
	MdButtonToggleModule, MdTabsModule, MdStepperModule
];

@NgModule({
	imports: modules,
	exports: modules,
})
export class MemoMaterialModule {
}
