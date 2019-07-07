import {Component, OnInit} from "@angular/core";
import {BehaviorSubject, Observable, Subject} from "rxjs";
import {ItemCostPreview} from "../../../../shared/model/accounting-state";
import {ActivatedRoute, Params} from "@angular/router";
import {debounceTime, map, scan} from "rxjs/operators";
import {FilterOptionFactoryService} from "../../../../shared/search/filter-option-factory.service";
import {SearchFilterService} from "../../../../shared/search/search-filter.service";
import {FilterOption} from "../../../../shared/search/filter-options/filter-option";
import {SortingOption} from "../../../../shared/model/sorting-option";
import {Event} from "../../../../shop/shared/model/event";
import {eventSortingOptions} from "../../../../shared/search/sorting-options";
import {PagedDataSource} from "../../../../shared/utility/material-table/paged-data-source";
import {ManualPagedDataSource} from "../../../../shared/utility/material-table/manual-paged-data-source";
import {EventService} from "../../../../shared/services/api/event.service";

@Component({
	selector: "memo-accounting-item-summary",
	templateUrl: "./accounting-item-summary.component.html",
	styleUrls: ["./accounting-item-summary.component.scss"]
})
export class AccountingItemSummaryComponent implements OnInit {
	sortingOptions: SortingOption<Event>[] = eventSortingOptions;

	itemPreviews$: BehaviorSubject<ItemCostPreview[]> = new BehaviorSubject([
		{
			itemId: 1,
			itemTitle: "Tolle Weihnachtsfahrt nach Nürnberg",
			totalBalance: 350.00
		},
		{
			itemId: 2,
			itemTitle: "Langweilige Tour nach Freiburg",
			totalBalance: -500.25
		}
	]);
	private _filterOptions$ = new BehaviorSubject<FilterOption[]>([
		this.filterOptionFactory.category,
		this.filterOptionFactory.price,
		this.filterOptionFactory.date,
	]);
	filterOptions$: Observable<FilterOption[]> = this._filterOptions$
		.asObservable()
		.pipe(
			debounceTime(200),
			scan(this.searchFilterService.mergeFilterOptions.bind(this.searchFilterService)),
			map(options => options.filter(option => option.isShown())),
		);

	page$ = new BehaviorSubject(PagedDataSource.initPaginatorFromUrl(this.activatedRoute.snapshot.queryParamMap));

	//results data handling
	resultsDataSource: ManualPagedDataSource<Event> = new ManualPagedDataSource<Event>(this.eventService, this.page$);

	onDestroy$ = new Subject();

	constructor(private filterOptionFactory: FilterOptionFactoryService,
				private activatedRoute: ActivatedRoute,
				private eventService: EventService,
				private searchFilterService: SearchFilterService) {
	}

	ngOnInit() {
	}


	public getDetailParams(id: number): Params {
		return {
			"eventId": id,
		}
	}


	updateQueryParams($event: Params) {
		console.log($event);
	}
}
