import {NgModule} from "@angular/core";
import {ExpandableTableComponent} from "./expandable-table.component";
import {DefaultExpandableTableCellComponent} from "./default-expandable-table-cell.component";
import {ExpandedTableRowContainerDirective} from "./expanded-table-row-container.directive";
import {SingleValueListExpandedRowComponent} from "./single-value-list-expanded-row/single-value-list-expanded-row.component";
import {MultiValueListExpandedRowComponent} from "./multi-value-list-expanded-row/multi-value-list-expanded-row.component";
import {ExpandableTableColumnContainerDirective} from "./expandable-table-column-container.directive";
import {CommonModule} from "@angular/common";
import {MemoMaterialModule} from "../../../material.module";
import {FormsModule} from "@angular/forms";
import {RouterModule} from "@angular/router";

@NgModule({
	imports: [
		FormsModule,
		CommonModule,
		RouterModule,
		MemoMaterialModule
	],
	declarations: [
		ExpandableTableComponent,
		DefaultExpandableTableCellComponent,
		ExpandedTableRowContainerDirective,
		SingleValueListExpandedRowComponent,
		MultiValueListExpandedRowComponent,
		ExpandableTableColumnContainerDirective
	],
	exports: [
		ExpandableTableComponent,
		SingleValueListExpandedRowComponent,
		MultiValueListExpandedRowComponent
	],
	entryComponents: [
		SingleValueListExpandedRowComponent,
		MultiValueListExpandedRowComponent,
		DefaultExpandableTableCellComponent
	]
})
export class ExpandableTableModule{}


export * from "./column-sorting-event";
export * from "./expanded-row.component";
export * from "./expandable-table-cell.component";
export * from "./expandable-table-column";
