import {Component, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {Observable} from "rxjs";
import {Tour} from "../shared/model/tour";
import {Merchandise} from "../shared/model/merchandise";
import {Party} from "../shared/model/party";
import {EventService} from "../../shared/services/event.service";
import {EventType} from "../shared/model/event-type";

export interface SearchResults {
	tours: Observable<Tour[]>,
	merch: Observable<Merchandise[]>,
	partys: Observable<Party[]>
}

@Component({
	selector: "memo-search-results",
	templateUrl: "./search-results.component.html",
	styleUrls: ["./search-results.component.scss"]
})
export class SearchResultComponent implements OnInit {
	term: Observable<string> = Observable.of("");
	results: SearchResults = {
		tours: Observable.of([]),
		merch: Observable.of([]),
		partys: Observable.of([])
	};

	constructor(private activatedRoute: ActivatedRoute,
				private eventService: EventService) {
	}

	ngOnInit() {
		this.term = this.activatedRoute.queryParamMap
			.filter(paramMap => paramMap.has("term"))
			.map(paramMap => paramMap.get("term"));

		this.results = {
			tours: this.term.flatMap(term => this.eventService.search(term, {eventType: EventType.tours})),
			merch: this.term.flatMap(term => this.eventService.search(term, {eventType: EventType.merch})),
			partys: this.term.flatMap(term => this.eventService.search(term, {eventType: EventType.partys}))
		};
	}

}
