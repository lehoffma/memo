import {Component, OnInit} from "@angular/core";
import {BehaviorSubject, Observable, of, Subject} from "rxjs";
import {ItemCostPreview} from "../../../../shared/model/accounting-state";
import {Params} from "@angular/router";
import {MultiLevelSelectParent} from "../../../../shared/utility/multi-level-select/shared/multi-level-select-parent";
import {debounceTime, map, scan} from "rxjs/operators";
import {FilterOptionFactoryService} from "../../../../shop/search-results/filter-option-factory.service";
import {SearchFilterService} from "../../../../shop/search-results/search-filter.service";

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
	private _filterOptions$ = new BehaviorSubject<MultiLevelSelectParent[]>([
		this.filterOptionFactory.category,
		this.filterOptionFactory.price,
		this.filterOptionFactory.date,
	]);
	filterOptions$: Observable<MultiLevelSelectParent[]> = this._filterOptions$
		.asObservable()
		.pipe(
			debounceTime(200),
			scan(this.searchFilterService.mergeFilterOptions.bind(this.searchFilterService)),
			map(options => options.filter(option => option.children && option.children.length > 0)),
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
