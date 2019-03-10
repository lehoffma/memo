import {Component, OnInit} from "@angular/core";
import {BehaviorSubject, Observable, of, Subject} from "rxjs";
import {ItemCostPreview} from "../../../../shared/model/accounting-state";
import {Params} from "@angular/router";
import {MultiLevelSelectParent} from "../../../../shared/utility/multi-level-select/shared/multi-level-select-parent";
import {debounceTime, map, scan} from "rxjs/operators";
import {FilterOptionFactoryService} from "../../../../shared/search/filter-option-factory.service";
import {SearchFilterService} from "../../../../shared/search/search-filter.service";
import {FilterOption} from "../../../../shared/search/filter-options/filter-option";

@Component({
	selector: "memo-accounting-item-summary",
	templateUrl: "./accounting-item-summary.component.html",
	styleUrls: ["./accounting-item-summary.component.scss"]
})
export class AccountingItemSummaryComponent implements OnInit {
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
		this.filterOptionFactory.category2,
		this.filterOptionFactory.price2,
		this.filterOptionFactory.date2,
	]);
	filterOptions$: Observable<FilterOption[]> = this._filterOptions$
		.asObservable()
		.pipe(
			debounceTime(200),
			scan(this.searchFilterService.mergeFilterOptions.bind(this.searchFilterService)),
			map(options => options.filter(option => option.isShown())),
		);
	onDestroy$ = new Subject();

	constructor(private filterOptionFactory: FilterOptionFactoryService,
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
