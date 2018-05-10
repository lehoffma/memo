import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {EventService} from "../../shared/services/api/event.service";
import {Event} from "../shared/model/event";
import {SortingOption} from "../../shared/model/sorting-option";
import {eventSortingOptions} from "./sorting-options";
import {MultiLevelSelectParent} from "app/shared/utility/multi-level-select/shared/multi-level-select-parent";
import {isMultiLevelSelectLeaf} from "../../shared/utility/multi-level-select/shared/multi-level-select-option";
import {SearchFilterService} from "./search-filter.service";
import {FilterOptionBuilder} from "./filter-option-builder.service";
import {FilterOptionType} from "./filter-option-type";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {debounceTime, map, mergeMap, scan, tap} from "rxjs/operators";
import {combineLatest} from "rxjs/observable/combineLatest";
import {Observable} from "rxjs/Observable";
import {Subscription} from "rxjs/Subscription";
import {Filter} from "../../shared/model/api/filter";
import {Sort} from "../../shared/model/api/sort";
import {PageRequest} from "../../shared/model/api/page-request";
import {NOW} from "../../util/util";

type SortingQueryParameter = { sortedBy: string; descending: string; };

@Component({
	selector: "memo-search-results",
	templateUrl: "./search-results.component.html",
	styleUrls: ["./search-results.component.scss"]
})
export class SearchResultComponent implements OnInit, OnDestroy {
	keywords: Observable<string> = this.activatedRoute.queryParamMap
		.pipe(
			map(paramMap => paramMap.has("searchTerm")
				? paramMap.get("searchTerm")
				: "")
		);
	sortedBy: Observable<Sort> = this.activatedRoute.queryParamMap
		.pipe(
			map(paramMap => paramMap.has("sortBy") && paramMap.has("direction")
				? Sort.by(paramMap.get("direction"), paramMap.getAll("sortBy").join("|"))
				: Sort.none())
		);
	filteredBy: Observable<Filter> = this.activatedRoute.queryParamMap
		.pipe(
			map(paramMap => {
				let paramObject = {};
				paramMap.keys
					.forEach(key => {
						let value = paramMap.get(key);
						if (key.toLowerCase() === "date") {
							if (value === "past") {
								key = "maxDate";
							}
							else if (value === "upcoming") {
								key = "minDate";
							}
							value = NOW.toISOString();
						}
						paramObject[key] = value;
					});
				return Filter.by(paramObject);
			})
		);

	resultsTitle: BehaviorSubject<string> = new BehaviorSubject("");
	sortingOptions: SortingOption<Event>[] = eventSortingOptions;
	private _filterOptions$ = new BehaviorSubject<MultiLevelSelectParent[]>([]);
	filterOptions$ = this._filterOptions$
		.asObservable()
		.pipe(
			debounceTime(200),
			scan(this.searchFilterService.mergeFilterOptions.bind(this.searchFilterService)),
			map(options => options.filter(option => option.children && option.children.length > 0))
		);

	get filterOptions() {
		return this._filterOptions$.getValue();
	}

	set filterOptions(options) {
		this._filterOptions$.next(options);
	}

	subscription: Subscription;

	constructor(private activatedRoute: ActivatedRoute,
				private searchFilterService: SearchFilterService,
				private filterOptionBuilder: FilterOptionBuilder,
				private eventService: EventService) {
	}

	_results$: Observable<Event[]>;

	get results$() {
		return this._results$;
	}

	set results$(results: Observable<Event[]>) {
		this._results$ = results;
	}

	ngOnInit() {
		//todo pagination!
		this.fetchResults(PageRequest.first());
	}

	ngOnDestroy() {
		if (this.subscription) {
			this.subscription.unsubscribe();
		}
	}

	/**
	 * Holt die Suchergebnisse aus den jeweiligen Services und sortiert und filtert sie anhand der
	 * sortedBy und filteredBy werte.
	 */
	fetchResults(pageRequest: PageRequest) {
		/*

		 */

		this.results$ = combineLatest(this.sortedBy, this.filteredBy)
			.pipe(
				//reset results so the result screen can show a loading screen while the http call is performed
				// tap(() => this.results$ = empty()),
				mergeMap(([sortedBy, filteredBy]) => this.eventService.get(
					filteredBy,
					pageRequest,
					sortedBy,
				)),
				map(it => it.content),

				tap(events =>
					this.subscription = this.filterOptionBuilder
						.empty()
						.withOptions(
							FilterOptionType.EVENT_CATEGORY,
							FilterOptionType.DATE,
							FilterOptionType.PRICE,
							FilterOptionType.COLOR,
							FilterOptionType.MATERIAL,
							FilterOptionType.SIZE
						)
						.build(events)
						.pipe(
							mergeMap(options => this.searchFilterService.initFilterMenu(this.activatedRoute, options)),
							tap(filterOptions => {
								this.filterOptions = filterOptions;
								let categoryFilterOption = this.filterOptions.find(option => option.name === "Kategorie");
								let selectedCategories: string[] = categoryFilterOption.children
									.filter(child => isMultiLevelSelectLeaf(child) ? child.selected : false)
									.map(child => child.name);

								//todo ausgewählte filter optionen in den title reintun
								this.resultsTitle.next(events.length + " " + selectedCategories.join(", ") +
									" Ergebnisse");
							})
						)
						.subscribe()
				)
			);

	}

}
