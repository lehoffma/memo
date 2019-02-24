import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from "@angular/core";
import {Merchandise} from "../shop/shared/model/merchandise";
import {Event} from "../shop/shared/model/event";
import {EventService} from "../shared/services/api/event.service";
import {EventType, typeToInteger} from "../shop/shared/model/event-type";
import {ShopItemType} from "../shop/shared/model/shop-item-type";
import {LogInService} from "../shared/services/api/login.service";
import {map, mergeMap, startWith, tap} from "rxjs/operators";
import {combineLatest, Observable, Subject} from "rxjs";
import {flatten, NOW} from "../util/util";
import {PageRequest} from "../shared/model/api/page-request";
import {Direction, Sort} from "../shared/model/api/sort";
import {Filter} from "../shared/model/api/filter";
import {HttpClient} from "@angular/common/http";
import {WindowService} from "../shared/services/window.service";
import {ImageLazyLoadService} from "../shared/services/image-lazy-load.service";

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
export class HomeComponent implements OnInit, OnDestroy {
	events: EventsPreview[] = [
		{
			title: "Touren",
			route: "/shop/tours",
			type: ShopItemType.tour,
			events: this.loginService.isLoggedInObservable()
				.pipe(
					mergeMap(() => this.eventService.get(
						Filter.by({
							"type": typeToInteger(EventType.tours) + "",
							"minDate": NOW.toISOString()
						}),
						PageRequest.first(7),
						Sort.by(Direction.ASCENDING, "date"))
					),
					map(it => it.content)
				)
		},
		{
			title: "Veranstaltungen",
			route: "/shop/partys",
			type: ShopItemType.party,
			events: this.loginService.isLoggedInObservable()
				.pipe(
					mergeMap(() => this.eventService.get(
						Filter.by({
							"type": typeToInteger(EventType.partys) + "",
							"minDate": NOW.toISOString()
						}),
						PageRequest.first(7),
						Sort.by(Direction.ASCENDING, "date"))
					),
					map(it => it.content)
				)
		},
		{
			title: "Merchandise",
			route: "/shop/merch",
			type: ShopItemType.merch,
			events: this.loginService.isLoggedInObservable()
				.pipe(
					mergeMap(() => this.eventService.get(
						Filter.by({
							"type": typeToInteger(EventType.merch) + ""
						}),
						PageRequest.first(7),
						Sort.by(Direction.ASCENDING, "date"))
					),
					map(it => it.content)
				)
		},
	];

	onDestroy$ = new Subject<any>();

	private heroImageUrl = "landing-page-hero-image";

	public hasBeenLoadedOnce = this.imageLazyLoadService.hasBeenLoaded(this.heroImageUrl, this.windowService.dimensions);

	heroImage$ = this.windowService.dimension$
		.pipe(
			mergeMap(dimensions => this.imageLazyLoadService.getImage(this.heroImageUrl, dimensions)),
			tap(() => setTimeout(() => this.hasBeenLoadedOnce = true, 100))
		);

	combinedEvents: Observable<Event[]>;
	userIsLoggedOut$ = this.loginService.isLoggedInObservable()
		.pipe(map(it => !it));


	constructor(private eventService: EventService,
				private http: HttpClient,
				private cdRef: ChangeDetectorRef,
				private windowService: WindowService,
				private imageLazyLoadService: ImageLazyLoadService,
				private loginService: LogInService) {
	}

	ngOnInit(): void {
		this.combinedEvents = combineLatest(
			...this.events.map(it => it.events)
		).pipe(
			map((events: Event[][]) => flatten(events))
		)
	}

	ngOnDestroy(): void {
		this.onDestroy$.next();
		this.onDestroy$.complete();
	}
}
