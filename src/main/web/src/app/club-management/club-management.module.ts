import {NgModule} from "@angular/core";
import {ClubManagementRoutingModule, routedComponents} from "./club-management.routing";
import {AccountingOptionsComponent} from "./accounting/accounting-options/accounting-options.component";
import {EntryCategoryCellComponent} from "./accounting/accounting-table-cells/entry-category-cell.component";
import {CostValueTableCellComponent} from "./accounting/accounting-table-cells/cost-value-table-cell.component";
import {AddressTableCellComponent} from "./administration/member-list/member-list-table-cells/address-table-cell.component";
import {BooleanCheckMarkCellComponent} from "./administration/member-list/member-list-table-cells/boolean-checkmark-cell.component";
import {ClubRoleTableCellComponent} from "./administration/member-list/member-list-table-cells/clubrole-table-cell.component";
import {DateTableCellComponent} from "./administration/member-list/member-list-table-cells/date-table-cell.component";
import {EmailTableCellComponent} from "./administration/member-list/member-list-table-cells/email-table-cell.component";
import {GenderCellComponent} from "./administration/member-list/member-list-table-cells/gender-cell.component";
import {MobileTableCellComponent} from "./administration/member-list/member-list-table-cells/mobile-table-cell.component";
import {PictureTableCellComponent} from "./administration/member-list/member-list-table-cells/picture-table-cell.component";
import {ProfileLinkCellComponent} from "./administration/member-list/member-list-table-cells/profile-link-cell.component";
import {TelephoneTableCellComponent} from "./administration/member-list/member-list-table-cells/telephone-table-cell.component";
import {CommonModule} from "@angular/common";
import {SharedModule} from "../shared/shared.module";
import {MemoMaterialModule} from "../../material.module";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {PieChartModule} from "@swimlane/ngx-charts";
import {MerchStockTableCellComponent} from "./administration/stock/merch-stock/merch-stock-table-cell.component";
import {MerchStockFeedComponent} from "./administration/stock/merch-stock/merch-stock-feed/merch-stock-feed.component";
import {MerchStockEntryComponent} from "app/club-management/administration/stock/merch-stock/merch-stock-entry/merch-stock-entry.component";
import {SearchFilterService} from "../shop/search-results/search-filter.service";
import {SearchModule} from "../shop/search-results/search.module";
import {MilesLeaderboardEntryComponent} from "app/club-management/miles-leaderboard/miles-leaderboard-entry.component";

const tableCellComponents = [
	//accounting table cells
	EntryCategoryCellComponent,
	CostValueTableCellComponent,

	//merch table cell
	MerchStockTableCellComponent,

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
	TelephoneTableCellComponent
];


@NgModule({
	imports: [
		FormsModule,
		ReactiveFormsModule,
		CommonModule,
		MemoMaterialModule,
		PieChartModule,
		SharedModule,
		SearchModule,
		ClubManagementRoutingModule
	],
	declarations: [
		routedComponents,
		AccountingOptionsComponent,
		tableCellComponents,
		MerchStockFeedComponent,
		MerchStockEntryComponent,
		MilesLeaderboardEntryComponent,
	],
	providers: [
		SearchFilterService
	],
	entryComponents: [tableCellComponents]
})
export class ClubManagementModule{}