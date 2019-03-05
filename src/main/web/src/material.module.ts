import {NgModule} from "@angular/core";
import {
	MatAutocompleteModule,
	MatBadgeModule,
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
	MatTooltipModule,
	MatRippleModule
} from "@angular/material";
import {ScrollingModule} from "@angular/cdk/scrolling";
import {LayoutModule} from "@angular/cdk/layout";
import {TextFieldModule} from "@angular/cdk/text-field";

const modules = [MatButtonModule, MatCheckboxModule, MatNativeDateModule, MatDatepickerModule,
	MatMenuModule, MatSidenavModule, MatToolbarModule, MatCardModule,
	MatIconModule, MatDialogModule, MatTooltipModule, MatSnackBarModule,
	MatListModule, MatSelectModule, MatInputModule, MatRadioModule,
	MatAutocompleteModule, MatChipsModule, MatProgressSpinnerModule,
	MatButtonToggleModule, MatTabsModule, MatTableModule, MatStepperModule, MatBadgeModule,
	MatPaginatorModule, MatSortModule, LayoutModule, TextFieldModule,
	ScrollingModule, MatRippleModule
];

@NgModule({
	imports: modules,
	exports: modules,
})
export class MemoMaterialModule {
}
