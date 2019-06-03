import {NgModule} from "@angular/core";
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatBadgeModule } from "@angular/material/badge";
import { MatButtonModule } from "@angular/material/button";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatChipsModule } from "@angular/material/chips";
import { MatNativeDateModule, MatRippleModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatListModule } from "@angular/material/list";
import { MatMenuModule } from "@angular/material/menu";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatRadioModule } from "@angular/material/radio";
import { MatSelectModule } from "@angular/material/select";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatSortModule } from "@angular/material/sort";
import { MatStepperModule } from "@angular/material/stepper";
import { MatTableModule } from "@angular/material/table";
import { MatTabsModule } from "@angular/material/tabs";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatTooltipModule } from "@angular/material/tooltip";
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
