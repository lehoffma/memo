import {Component, OnInit} from "@angular/core";
import {ActivatedRoute} from "@angular/router";
import {Observable} from "rxjs";
import {MerchStore} from "../../shared/stores/merch.store";
import {TourStore} from "../../shared/stores/tour.store";
import {PartyStore} from "../../shared/stores/party.store";
import {Tour} from "../shared/model/tour";
import {Merchandise} from "../shared/model/merchandise";
import {Party} from "../shared/model/party";

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
				private merchandiseStore: MerchStore,
				private tourStore: TourStore,
				private partyStore: PartyStore) {
	}

	ngOnInit() {
		this.term = this.activatedRoute.queryParamMap
			.filter(paramMap => paramMap.has("term"))
			.map(paramMap => paramMap.get("term"));

		//TODO: server-side prefix/fuzzy search
		this.results = {
			tours: this.term.flatMap(term =>
				this.tourStore.data.map(tours => tours.filter(tour => tour.title.includes(term)))
			),
			merch: this.term.flatMap(term =>
				this.merchandiseStore.data.map(merchandise => merchandise.filter(merch => merch.title.includes(term)))
			),
			partys: this.term.flatMap(term =>
				this.partyStore.data.map(partys => partys.filter(party => party.title.includes(term)))
			)
		};
	}

}
