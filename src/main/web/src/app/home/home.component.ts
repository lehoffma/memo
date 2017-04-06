import {Component, OnInit} from "@angular/core";
import {Merchandise} from "../shop/shared/model/merchandise";
import {Event} from "../shop/shared/model/event";
import {TourStore} from "../shared/stores/tour.store";
import {MerchStore} from "../shared/stores/merch.store";
import {PartyStore} from "../shared/stores/party.store";
import {Observable} from "rxjs";

interface EventsPreview {
	title: string,
	route: string,
	events: Observable<Event[]>
}

@Component({
	selector: "memo-home",
	templateUrl: "./home.component.html",
	styleUrls: ["./home.component.scss"]
})
export class HomeComponent implements OnInit {
	events: EventsPreview[] = [];

	constructor(public tourStore: TourStore,
				public merchStore: MerchStore,
				public partyStore: PartyStore) {
	}

	ngOnInit(): void {
		//get up to 7 preview items per category
		this.events = [
			{
				title: "Touren",
				route: "tours",
				events: this.tourStore.data.map(data => data.slice(0, 7))
			},
			{
				title: "Veranstaltungen",
				route: "partys",
				events: this.partyStore.data.map(data => data.slice(0, 7))
			},
			{
				title: "Merchandise",
				route: "merch",
				events: this.merchStore.data.map(data => data.slice(0, 7))
			},
		];
	}

}
