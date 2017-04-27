import {Component, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {Observable} from "rxjs";
import {EventService} from "../../shared/services/event.service";
import {EventType} from "../shared/model/event-type";
import {Event} from "../shared/model/event";
import {SortingOption} from "../../shared/model/sorting-option";
import {eventSortingOptions} from "./sorting-options";
import {attributeSortingFunction} from "../../util/util";
import {isNullOrUndefined} from "util";

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
	//todo
	filteredBy: Observable<any> = Observable.of("");

	results: Observable<Event[]>;

	sortingOptions: SortingOption<Event>[] = eventSortingOptions;
	// eventFilteringOptions: FilterOption<Event>[] = filterOptions;


	constructor(private activatedRoute: ActivatedRoute,
				private eventService: EventService) {
	}

	fetchResults(): Observable<Event[]> {
		return Observable.combineLatest(this.keywords, this.sortedBy, this.filteredBy)
			.flatMap(([keywords, sortedBy, filteredBy]) =>
				Observable.combineLatest(
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
					.map(events => {
						//filtere events
						return events;
					})
			);
	}

	ngOnInit() {
		this.results = this.fetchResults();
	}

}
