import {Component, OnDestroy, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {Observable, Subscription} from "rxjs";
import {EventService} from "../../shared/services/api/event.service";
import {EventType} from "../shared/model/event-type";
import {Event} from "../shared/model/event";
import {SortingOption} from "../../shared/model/sorting-option";
import {eventSortingOptions} from "./sorting-options";
import {attributeSortingFunction} from "../../util/util";
import {isNullOrUndefined} from "util";
import {MultiLevelSelectParent} from "app/shared/multi-level-select/shared/multi-level-select-parent";
import {isMultiLevelSelectLeaf} from "../../shared/multi-level-select/shared/multi-level-select-option";
import {SearchFilterService} from "./search-filter.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {FilterOptionBuilder} from "./filter-option-builder.service";
import {FilterOptionType} from "./filter-option-type";

type sortingQueryParameter = { sortedBy: string; descending: string; };

@Component({
	selector: "memo-search-results",
	templateUrl: "./search-results.component.html",
	styleUrls: ["./search-results.component.scss"]
})
export class SearchResultComponent implements OnInit, OnDestroy{
	keywords: Observable<string> = this.activatedRoute.queryParamMap
		.map(paramMap => paramMap.has("keywords")
			? paramMap.get("keywords")
			: "");
	sortedBy: Observable<sortingQueryParameter> = this.activatedRoute.queryParamMap
		.map(paramMap => paramMap.has("sortBy") && paramMap.has("descending")
			? {sortedBy: paramMap.get("sortBy"), descending: paramMap.get("descending")}
			: {});
	filteredBy: Observable<any> = this.activatedRoute.queryParamMap
		.map(paramMap => {
			let paramObject = {};
			paramMap.keys.forEach(key => paramObject[key] = paramMap.get(key));
			return paramObject;
		});

	resultsTitle: BehaviorSubject<string> = new BehaviorSubject("");
	sortingOptions: SortingOption<Event>[] = eventSortingOptions;
	private _filterOptions$ = new BehaviorSubject<MultiLevelSelectParent[]>([]);
	filterOptions$ = this._filterOptions$
		.asObservable()
		.debounceTime(200)
		.scan(this.searchFilterService.mergeFilterOptions.bind(this.searchFilterService))
		.map(options => options.filter(option => option.children && option.children.length > 0));

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
				private router: Router,
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
		this.fetchResults();
	}

	ngOnDestroy(){
		if(this.subscription){
			this.subscription.unsubscribe();
		}
	}

	/**
	 * Holt die Suchergebnisse aus den jeweiligen Services und sortiert und filtert sie anhand der
	 * sortedBy und filteredBy werte.
	 */
	fetchResults() {
		this.subscription = Observable.combineLatest(this.keywords, this.sortedBy, this.filteredBy)
			.subscribe(([keywords, sortedBy, filteredBy]) => {
				//todo isLoading = true; + use Observable.scan

				//reset results so the result screen can show a loading screen while the http call is performed
				this.results$ = Observable.empty();

				this.results$ = Observable.combineLatest(
					this.eventService.search(keywords, EventType.tours),
					this.eventService.search(keywords, EventType.partys),
					this.eventService.search(keywords, EventType.merch),
					(tours, partys, merch) => [...tours, ...partys, ...merch]
				)
				//todo replace with actual api call?
					.map(events => {
						//sortiere events
						if (sortedBy && sortedBy.sortedBy && !isNullOrUndefined(sortedBy)) {
							events = events.sort(attributeSortingFunction(sortedBy.sortedBy, sortedBy.descending === "true"));
						}

						return events;
					})
					//todo replace with actual api call?
					.flatMap((events: Event[]) => {
						return Observable.combineLatest(
							...events.map(event => this.searchFilterService.satisfiesFilters(event, filteredBy)
								.map(satisfiesFilters => ({
									event,
									satisfiesFilters
								})))
						)
							.map((isFilteredList: { event: Event, satisfiesFilters: boolean }[]) =>
								isFilteredList.filter(it => it.satisfiesFilters)
									.map(it => it.event)
							)
							.defaultIfEmpty(events)
					})
					//Updated den Suchergebnisse Titel anhand der ausgewählten Kategorien und der Menge an Ergebnissen.
					.do(events => {
						this.filterOptionBuilder
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
							.flatMap(options => this.searchFilterService.initFilterMenu(this.activatedRoute, options))
							.subscribe(filterOptions => {
								this.filterOptions = filterOptions;
								let categoryFilterOption = this.filterOptions.find(option => option.queryKey === "category");
								let selectedCategories: string[] = categoryFilterOption.children
									.filter(child => isMultiLevelSelectLeaf(child) ? child.selected : false)
									.map(child => child.name);

								//todo ausgewählte filter optionen in den title reintun
								this.resultsTitle.next(events.length + " " + selectedCategories.join(", ") +
									" Ergebnisse" + (keywords === "" ? "" : " für '" + keywords + "'") +
									"");
							});
					})
			}
		);
	}

}
