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
		MdListModule, MdSelectModule, MdInputModule,],
	exports: [MdButtonModule, MdCheckboxModule, MdNativeDateModule, MdDatepickerModule,
		MdMenuModule, MdSidenavModule, MdToolbarModule, MdCardModule,
		MdIconModule, MdDialogModule, MdTooltipModule, MdSnackBarModule,
		MdListModule, MdSelectModule, MdInputModule],
})
export class MemoMaterialModule {
}
