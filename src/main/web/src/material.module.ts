import {NgModule} from "@angular/core";
import {
	MatAutocompleteModule,
	MatButtonModule,
	MatButtonToggleModule,
	MatCardModule,
	MatCheckboxModule,
	MatChipsModule,
	MatDatepickerModule,
	MatDialogModule,
	MatIconModule,
	MatInputModule,
	MatListModule,
	MatMenuModule,
	MatNativeDateModule,
	MatProgressSpinnerModule,
	MatRadioModule,
	MatSelectModule,
	MatSidenavModule,
	MatSnackBarModule,
	MatStepperModule,
	MatTabsModule,
	MatToolbarModule,
	MatTooltipModule,
} from "@angular/material";

const modules = [MatButtonModule, MatCheckboxModule, MatNativeDateModule, MatDatepickerModule,
	MatMenuModule, MatSidenavModule, MatToolbarModule, MatCardModule,
	MatIconModule, MatDialogModule, MatTooltipModule, MatSnackBarModule,
	MatListModule, MatSelectModule, MatInputModule, MatRadioModule,
	MatAutocompleteModule, MatChipsModule, MatProgressSpinnerModule,
	MatButtonToggleModule, MatTabsModule, MatStepperModule
];

@NgModule({
	imports: modules,
	exports: modules,
})
export class MemoMaterialModule {
}
