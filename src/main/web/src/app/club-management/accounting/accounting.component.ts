import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {Dimension, WindowService} from "../../shared/services/window.service";
import {AccountingTableContainerService} from "./accounting-table-container.service";
import {map, mergeMap, startWith} from "rxjs/operators";
import {ExpandableMaterialTableComponent, TableColumn} from "../../shared/utility/material-table/expandable-material-table.component";
import {Entry} from "../../shared/model/entry";
import {ResponsiveColumnsHelper} from "../../shared/utility/material-table/responsive-columns.helper";
import {BreakpointObserver} from "@angular/cdk/layout";
import {EntryService} from "../../shared/services/api/entry.service";
import {of} from "rxjs";
import {NavigationService} from "../../shared/services/navigation.service";
import {Sort} from "../../shared/model/api/sort";

@Component({
	selector: "memo-accounting",
	templateUrl: "./accounting.component.html",
	styleUrls: ["./accounting.component.scss"],
	providers: [AccountingTableContainerService]
})
export class AccountingComponent implements OnInit, OnDestroy, AfterViewInit {

	showOptions = true;
	mobile = false;

	subscriptions = [];


	columns: TableColumn<Entry>[] = [
		{
			columnDef: "image",
			header: "Bild",
			cell: element => element.images.length > 0 ? element.images[0] : "resources/images/Logo.png",
			type: "image"
		},
		{columnDef: "date", header: "Datum", cell: element => element.date.toISOString(), type: "date"},
		{columnDef: "name", header: "Name", cell: element => element.name},
		{columnDef: "category", header: "Kategorie", cell: element => element.category.name},
		{columnDef: "value", header: "Wert", cell: element => element.value.toString(), type: "costValue"},
	];
	displayedColumns$ = this.getDisplayedColumns();

	filter$ = this.navigationService.queryParamMap$.pipe(
		map(queryParamMap => this.entryService.paramMapToFilter(queryParamMap))
	);
	total$ = this.filter$.pipe(
		mergeMap(filter => this.entryService.getAll(filter, Sort.none())),
		map(entries => entries.reduce((acc, entry) => acc + entry.value, 0))
	);

	@ViewChild(ExpandableMaterialTableComponent) table: ExpandableMaterialTableComponent<Entry>;

	constructor(private windowService: WindowService,
				private navigationService: NavigationService,
				private breakpointObserver: BreakpointObserver,
				public entryService: EntryService,
				public accountingTableContainerService: AccountingTableContainerService) {

		this.subscriptions.push(this.windowService.dimension$
			.subscribe(dimensions => this.onResize(dimensions)));
	}

	ngOnInit() {
	}

	ngOnDestroy() {
		this.subscriptions.forEach(it => it.unsubscribe());
	}


	getDisplayedColumns() {
		const columnHelper = new ResponsiveColumnsHelper(this.columns, this.breakpointObserver);
		columnHelper.addPixelBreakpoint(850, "image", "category", "date");
		columnHelper.addPixelBreakpoint(0, "name", "value");
		return columnHelper.build()
			.pipe(startWith([]));
	}


	/**
	 * Updates the columns and way the options are presented depending on the given width/height object
	 * @param {Dimension} dimension the current window dimensions
	 */
	onResize(dimension: Dimension) {
		let mobile = dimension.width < 850;
		this.showOptions = !mobile;
		this.mobile = mobile;
	}

	ngAfterViewInit(): void {
		this.accountingTableContainerService.dataSource = this.table.dataSource;
	}

}
