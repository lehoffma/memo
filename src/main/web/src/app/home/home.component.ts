import {ChangeDetectionStrategy, Component, OnInit} from "@angular/core";
import {Merchandise} from "../shop/shared/model/merchandise";
import {Event} from "../shop/shared/model/event";
import {EventService} from "../shared/services/api/event.service";
import {EventType, typeToInteger} from "../shop/shared/model/event-type";
import {ShopItemType} from "../shop/shared/model/shop-item-type";
import {LogInService} from "../shared/services/api/login.service";
import {map, mergeMap} from "rxjs/operators";
import {Observable} from "rxjs/Observable";
import {isAfter} from "date-fns";
import {dateSortingFunction} from "../util/util";
import {PageRequest} from "../shared/model/api/page-request";
import {Sort, SortDirectionEnum} from "../shared/model/api/sort";
import {Filter} from "../shared/model/api/filter";

interface EventsPreview {
	title: string,
	route: string,
	type: ShopItemType,
	events: Observable<Event[]>
}

@Component({
	selector: "memo-home",
	templateUrl: "./home.component.html",
	styleUrls: ["./home.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
	now = new Date();

	events: EventsPreview[] = [
		{
			title: "Touren",
			route: "tours",
			type: ShopItemType.tour,
			events: this.loginService.isLoggedInObservable()
				.pipe(
					mergeMap(() => this.eventService.get(
						Filter.by({
							"type": typeToInteger(EventType.tours) + "",
							"minDate": this.now.toISOString()
						}),
						PageRequest.first(7),
						Sort.by(SortDirectionEnum.ASCENDING, "date"))
					),
					map(it => it.content)
				)
		},
		{
			title: "Veranstaltungen",
			route: "partys",
			type: ShopItemType.party,
			events: this.loginService.isLoggedInObservable()
				.pipe(
					mergeMap(() => this.eventService.get(
						Filter.by({
							"type": typeToInteger(EventType.partys)+ "",
							"minDate": this.now.toISOString()
						}),
						PageRequest.first(7),
						Sort.by(SortDirectionEnum.ASCENDING, "date"))
					),
					map(it => it.content)
				)
		},
		{
			title: "Merchandise",
			route: "merch",
			type: ShopItemType.merch,
			events: this.loginService.isLoggedInObservable()
				.pipe(
					mergeMap(() => this.eventService.get(
						Filter.by({
							"type": typeToInteger(EventType.merch) + ""
						}),
						PageRequest.first(7),
						Sort.by(SortDirectionEnum.ASCENDING, "date"))
					),
					map(it => it.content)
				)
		},
	];


	userIsLoggedIn$ = this.loginService.isLoggedInObservable();

	constructor(private eventService: EventService,
				private loginService: LogInService) {
	}

	ngOnInit(): void {
	}


	filterEvents(events: Event[]): Event[] {
		return events.filter(event => isAfter(event.date, new Date()))
			.sort(dateSortingFunction<Event>(it => it.date, false))
			.slice(0, 7);
	}
}
