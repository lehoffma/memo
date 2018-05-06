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
	MatPaginatorModule,
	MatProgressSpinnerModule,
	MatRadioModule,
	MatSelectModule,
	MatSidenavModule,
	MatSnackBarModule,
	MatSortModule,
	MatStepperModule,
	MatTableModule,
	MatTabsModule,
	MatToolbarModule,
	MatTooltipModule
} from "@angular/material";
import {ScrollDispatchModule} from "@angular/cdk/scrolling";
import {LayoutModule} from "@angular/cdk/layout";

const modules = [MatButtonModule, MatCheckboxModule, MatNativeDateModule, MatDatepickerModule,
	MatMenuModule, MatSidenavModule, MatToolbarModule, MatCardModule,
	MatIconModule, MatDialogModule, MatTooltipModule, MatSnackBarModule,
	MatListModule, MatSelectModule, MatInputModule, MatRadioModule,
	MatAutocompleteModule, MatChipsModule, MatProgressSpinnerModule,
	MatButtonToggleModule, MatTabsModule, MatTableModule, MatStepperModule,
	MatPaginatorModule, MatSortModule, LayoutModule,
	ScrollDispatchModule
];

@NgModule({
	imports: modules,
	exports: modules,
})
export class MemoMaterialModule {
}
