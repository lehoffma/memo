import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {Observable} from "rxjs";
import {EventService} from "../../shared/services/event.service";
import {EventType} from "../shared/model/event-type";
import {Event} from "../shared/model/event";
import {SortingOption} from "../../shared/model/sorting-option";
import {eventSortingOptions} from "./sorting-options";
import {attributeSortingFunction} from "../../util/util";
import {isNullOrUndefined} from "util";
import {MultiLevelSelectParent} from "app/shared/multi-level-select/shared/multi-level-select-parent";
import {isMultiLevelSelectLeaf} from "../../shared/multi-level-select/shared/multi-level-select-option";
import {SearchFilterService} from "../../shared/services/search-filter.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

type sortingQueryParameter = { sortedBy: string; descending: string; };

@Component({
	selector: "memo-search-results",
	templateUrl: "./search-results.component.html",
	styleUrls: ["./search-results.component.scss"]
})
export class SearchResultComponent implements OnInit {
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
	_results$: Observable<Event[]>;

	get results$() {
		return this._results$;
	}

	set results$(results: Observable<Event[]>) {
		this._results$ = results;
	}

	sortingOptions: SortingOption<Event>[] = eventSortingOptions;
	filterOptions: MultiLevelSelectParent[] = [];


	constructor(private activatedRoute: ActivatedRoute,
				private searchFilterService: SearchFilterService,
				private router: Router,
				private eventService: EventService) {
	}

	ngOnInit() {
		this.fetchResults();
	}

	/**
	 * Schaut, ob die Route query parameter beinhaltet und initialisiert die filter menü checkboxen mit den
	 * jeweiligen werten
	 */
	initFilterMenu() {
		//checks if the route includes query parameters and initializes the filtermenus checkboxes
		this.activatedRoute.queryParamMap.first()
			.subscribe(queryParamMap => {
				this.filterOptions = this.filterOptions.map(filterOptionParent => {
					let key = filterOptionParent.queryKey;
					//if the key associated with the filter selection box is part of the query parameters,
					//update the filterOption's selected values.
					if (queryParamMap.has(key)) {
						let values: string[] = queryParamMap.get(key).split("|"); //something like 'tours|partys|merch'
						filterOptionParent.children.forEach(child => {
							if (isMultiLevelSelectLeaf(child)) {
								child.selected = values.includes(child.queryValue);
							}
						});
					}
					return filterOptionParent;
				})
			});
	}


	/**
	 * Holt die Suchergebnisse aus den jeweiligen Services und sortiert und filtert sie anhand der
	 * sortedBy und filteredBy werte.
	 */
	fetchResults() {
		Observable.combineLatest(this.keywords, this.sortedBy, this.filteredBy)
			.subscribe(([keywords, sortedBy, filteredBy]) => {
					//reset results so the result screen can show a loading screen while the http call is performed
					this.results$ = Observable.empty();

					this.results$ = Observable.combineLatest(
						this.eventService.search(keywords, EventType.tours),
						this.eventService.search(keywords, EventType.partys),
						this.eventService.search(keywords, EventType.merch),
						(tours, partys, merch) => [...tours, ...partys, ...merch]
					)
						.do(events => this.initFilterMenu())
						//todo replace with actual api call?
						.map(events => {
							//sortiere events
							if (sortedBy && sortedBy.sortedBy && !isNullOrUndefined(sortedBy)) {
								events = events.sort(attributeSortingFunction(sortedBy.sortedBy, sortedBy.descending === "true"));
							}

							return events;
						})
						//todo replace with actual api call?
						.map((events: Event[]) =>
							events.filter(event => this.searchFilterService.satisfiesFilters(event, filteredBy))
						)
						//Updated den Suchergebnisse Titel anhand der ausgewählten Kategorien und der Menge an Ergebnissen.
						.do(async events => {
							this.filterOptions = await this.searchFilterService.getEventFilterOptionsFromResults(events);
							let categoryFilterOption = this.filterOptions.find(option => option.queryKey === "category");
							let selectedCategories: string[] = categoryFilterOption.children
								.filter(child => isMultiLevelSelectLeaf(child) ? child.selected : false)
								.map(child => child.name);

							//todo ausgewählte filter optionen in den title reintun
							this.resultsTitle.next(events.length + " " + selectedCategories.join(", ") +
								" Ergebnisse" + (keywords === "" ? "" : " für '" + keywords + "'") +
								"");
						})
				}
			);
	}

}
