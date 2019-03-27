import {Component, OnDestroy, OnInit, ViewChild} from "@angular/core";
import {WindowService} from "../../../shared/services/window.service";
import {AccountingTableContainerService} from "../accounting-table-container.service";
import {map, mergeMap} from "rxjs/operators";
import {ExpandableMaterialTableComponent} from "../../../shared/utility/material-table/expandable-material-table.component";
import {Entry} from "../../../shared/model/entry";
import {EntryService} from "../../../shared/services/api/entry.service";
import {NavigationService} from "../../../shared/services/navigation.service";
import {Direction, Sort} from "../../../shared/model/api/sort";
import {Subject} from "rxjs";
import {Order} from "../../../shared/model/order";
import {SortingOption, SortingOptionHelper} from "../../../shared/model/sorting-option";
import {FilterOption, FilterOptionType} from "../../../shared/search/filter-options/filter-option";
import {DateRangeFilterOption} from "../../../shared/search/filter-options/date-range-filter-option";
import {ShopItemFilterOption} from "../../../shared/search/filter-options/shop-item-filter-option";
import {MultiFilterOption} from "../../../shared/search/filter-options/multi-filter-option";
import {EventService} from "../../../shared/services/api/event.service";
import {EntryCategoryService} from "../../../shared/services/api/entry-category.service";

@Component({
	selector: "memo-accounting",
	templateUrl: "./accounting.component.html",
	styleUrls: ["./accounting.component.scss"],
	providers: [AccountingTableContainerService]
})
export class AccountingComponent implements OnInit, OnDestroy {

	sortingOptions: SortingOption<any>[] = entrySortingOptions;
	filterOptions: FilterOption<FilterOptionType>[] = [
		new DateRangeFilterOption(
			"timestamp",
			"Datum",
		),
		new ShopItemFilterOption(
			"eventId",
			"Nach Item filtern",
			id => this.itemService.getById(id),
		),
	];

	onDestroy$ = new Subject<any>();

	//todo move to server
	total$ = this.accountingTableContainerService.filteredBy$.pipe(
		mergeMap(filter => this.entryService.getAll(filter, Sort.none())),
		map(entries => entries.reduce((acc, entry) => acc + entry.value, 0))
	);

	@ViewChild(ExpandableMaterialTableComponent) table: ExpandableMaterialTableComponent<Entry>;

	constructor(private windowService: WindowService,
				private itemService: EventService,
				private navigationService: NavigationService,
				public entryService: EntryService,
				private entryCategoryService: EntryCategoryService,
				public accountingTableContainerService: AccountingTableContainerService) {
		this.entryCategoryService.getCategories().subscribe(page => {
			let categories = page.content;

			console.log(categories.map(category => ({
				key: category,
				label: category,
				query: [{key: "entryType", value: category}]
			})));

			this.filterOptions = [...this.filterOptions, new MultiFilterOption(
				"entryType",
				"Kostenarten",
				categories.map(category => ({
					key: category.name,
					label: category.name,
					query: [{key: "entryType", value: category.name}]
				}))
			)]
		})
	}

	ngOnInit() {
	}

	ngOnDestroy() {
		this.onDestroy$.next();
		this.onDestroy$.complete();
	}
}


export const entrySortingOptions: SortingOption<Entry>[] = [
	SortingOptionHelper.build(
		"Datum neueste - älteste",
		Sort.by(Direction.DESCENDING, "date"),
		"Neu - Alt"
	),
	SortingOptionHelper.build(
		"Datum älteste - neueste",
		Sort.by(Direction.ASCENDING, "date"),
		"Alt - Neu"
	)
];

