import {NgModule} from "@angular/core";
import {
	MdButtonModule,
	MdCardModule,
	MdCheckboxModule,
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
		MdListModule, MdSelectModule, MdInputModule, MdRadioModule],
	exports: [MdButtonModule, MdCheckboxModule, MdNativeDateModule, MdDatepickerModule,
		MdMenuModule, MdSidenavModule, MdToolbarModule, MdCardModule,
		MdIconModule, MdDialogModule, MdTooltipModule, MdSnackBarModule,
		MdListModule, MdSelectModule, MdInputModule, MdRadioModule],
})
export class MemoMaterialModule {
}
