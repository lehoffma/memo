import {Component, OnInit} from "@angular/core";
import {Merchandise} from "../shop/shared/model/merchandise";
import {Event} from "../shop/shared/model/event";
import {EventService} from "../shared/services/api/event.service";
import {EventType} from "../shop/shared/model/event-type";
import {ShopItemType} from "../shop/shared/model/shop-item-type";
import {LogInService} from "../shared/services/api/login.service";
import {map} from "rxjs/operators";
import {Observable} from "rxjs/Observable";
import {isAfter} from "date-fns";
import {dateSortingFunction} from "../util/util";

interface EventsPreview {
	title: string,
	route: string,
	type: ShopItemType,
	events: Observable<Event[]>
}

@Component({
	selector: "memo-home",
	templateUrl: "./home.component.html",
	styleUrls: ["./home.component.scss"]
})
export class HomeComponent implements OnInit {
	events: EventsPreview[] = [
		{
			title: "Touren",
			route: "tours",
			type: ShopItemType.tour,
			events: this.eventService.search("", EventType.tours)
				.pipe(
					map(tours => this.filterEvents(tours))
				)
		},
		{
			title: "Veranstaltungen",
			route: "partys",
			type: ShopItemType.party,
			events: this.eventService.search("", EventType.partys)
				.pipe(
					map(partys => this.filterEvents(partys))
				)
		},
		{
			title: "Merchandise",
			route: "merch",
			type: ShopItemType.merch,
			events: this.eventService.search("", EventType.merch)
				.pipe(
					map(merch => merch.slice(0, 7))
				)
		},
	];

	userIsLoggedIn$ = this.loginService.isLoggedInObservable();

	constructor(private eventService: EventService,
				private loginService: LogInService) {
	}

	ngOnInit(): void {
	}


	filterEvents(events: Event[]): Event[]{
		return events.filter(event => isAfter(event.date, new Date()))
			.sort(dateSortingFunction<Event>(it => it.date, false))
			.slice(0, 7);
	}
}
