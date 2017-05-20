import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, NavigationEnd, Router} from "@angular/router";
import {Observable} from "rxjs";
import {EventService} from "../../shared/services/event.service";
import {EventType} from "../shared/model/event-type";
import {Event} from "../shared/model/event";
import {SortingOption} from "../../shared/model/sorting-option";
import {eventSortingOptions} from "./sorting-options";
import {attributeSortingFunction} from "../../util/util";
import {isNullOrUndefined} from "util";
import {UserService} from "../../shared/services/user.service";
import {eventFilterOptions} from "./event-filter-options";
import {MultiLevelSelectParent} from "app/shared/multi-level-select/shared/multi-level-select-parent";
import {isMultiLevelSelectLeaf} from "../../shared/multi-level-select/shared/multi-level-select-option";
import {EventUtilityService} from "../../shared/services/event-utility.service";

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
			//todo...
			let paramObject = {};
			paramMap.keys.forEach(key => paramObject[key] = paramMap.get(key));
			return paramObject;
		});

	resultsTitle: Observable<string>;
	results: Observable<Event[]>;

	sortingOptions: SortingOption<Event>[] = eventSortingOptions;
	filterOptions: MultiLevelSelectParent[] = eventFilterOptions;


	constructor(private activatedRoute: ActivatedRoute,
				private userService: UserService,
				private eventUtilityService: EventUtilityService,
				private router: Router,
				private eventService: EventService) {
	}

	ngOnInit() {
		this.fetchResults();

		//checks if the route includes query parameters and initializes the filtermenus checkboxes
		this.activatedRoute.queryParamMap.first()
			.subscribe(queryParamMap => {
				this.filterOptions = this.filterOptions.map(filterOptionParent => {
					let key = filterOptionParent.queryKey;
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

		this.resultsTitle = this.router.events.filter(event => event instanceof NavigationEnd)
			.flatMap(event => {
				let categoryFilterOption = this.filterOptions.find(option => option.queryKey === "category");
				let selectedCategories: string[] = categoryFilterOption.children
					.filter(child => isMultiLevelSelectLeaf(child) ? child.selected : false)
					.map(child => child.name);

				return Observable.combineLatest(this.results, this.keywords).map(([results, keywords]) =>
					results.length + " " + selectedCategories.join(", ") + " Ergebnisse" +
					(keywords === "" ? "" : " für '" + keywords + "'")
				);
			})
		// this.activatedRoute.queryParamMap.flatMap(queryParamMap => )
	}


	fetchResults() {
		Observable.combineLatest(this.keywords, this.sortedBy, this.filteredBy)
			.subscribe(([keywords, sortedBy, filteredBy]) => {
					//reset results so the result screen can show a loading screen while the http call is performed
					this.results = Observable.empty();

					this.results = Observable.combineLatest(
						this.eventService.search(keywords, {eventType: EventType.tours}),
						this.eventService.search(keywords, {eventType: EventType.partys}),
						this.eventService.search(keywords, {eventType: EventType.merch}),
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
						.map((events: Event[]) => {
							//todo add filter-functions to filteroptions so its not as hardcoded anymore
							let categoryFilters = filteredBy["category"];

							if (categoryFilters) {
								let categories: string[] = categoryFilters.split("|");
								return events.filter(event => categories.includes(this.eventUtilityService.getEventType(event).toString()))
							}

							//filtere events
							return events;
						})
				}
			);
	}

}
