import {NgModule} from "@angular/core";
import {AddressTableCellComponent} from "./cells/address-table-cell.component";
import {ClubRoleTableCellComponent} from "./cells/clubrole-table-cell.component";
import {PictureTableCellComponent} from "./cells/picture-table-cell.component";
import {GenderCellComponent} from "./cells/gender-cell.component";
import {DateTableCellComponent} from "./cells/date-table-cell.component";
import {MobileTableCellComponent} from "./cells/mobile-table-cell.component";
import {EmailTableCellComponent} from "./cells/email-table-cell.component";
import {ProfileLinkCellComponent} from "./cells/profile-link-cell.component";
import {BooleanCheckMarkCellComponent} from "./cells/boolean-checkmark-cell.component";
import {TelephoneTableCellComponent} from "./cells/telephone-table-cell.component";
import {MemoMaterialModule} from "../../../../material.module";
import {CommonModule} from "@angular/common";
import {ExpandableMaterialTableComponent} from "./expandable-material-table.component";
import {SharedPipesModule} from "../../pipes/shared-pipes.module";
import {RouterModule} from "@angular/router";
import {TableHeaderComponent} from "./actions/table-header.component";
import {ActionsCellComponent} from "./actions/actions-cell.component";
import {TableCellFactoryComponent} from "./table-cell-factory/table-cell-factory.component";
import {CostValueTableCellComponent} from "./cells/cost-value-table-cell.component";
import {EntryCategoryCellComponent} from "./cells/entry-category-cell.component";
import {MerchColorCellComponent} from "./cells/merch-color-cell.component";
import {LazyLoadingModule} from "../../lazy-loading/lazy-loading.module";

const tableCells = [
	//memberlist table cells
	AddressTableCellComponent,
	BooleanCheckMarkCellComponent,
	ClubRoleTableCellComponent,
	DateTableCellComponent,
	EmailTableCellComponent,
	GenderCellComponent,
	MobileTableCellComponent,
	PictureTableCellComponent,
	ProfileLinkCellComponent,
	TelephoneTableCellComponent,

	//accounting table cells
	EntryCategoryCellComponent,
	CostValueTableCellComponent,

	MerchColorCellComponent,
];

@NgModule({
	imports: [
		CommonModule,
		RouterModule,
		MemoMaterialModule,
		LazyLoadingModule,
		SharedPipesModule,
	],
	exports: [
		ExpandableMaterialTableComponent,
		tableCells
	],
	declarations: [
		ExpandableMaterialTableComponent,
		tableCells,
		TableHeaderComponent,
		ActionsCellComponent,
		TableCellFactoryComponent
	],
	providers: [],
})
export class ExpandableMaterialTableModule {
}
