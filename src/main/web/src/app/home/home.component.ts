import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit} from "@angular/core";
import {Event, ShopEvent} from "../shop/shared/model/event";
import {EventService} from "../shared/services/api/event.service";
import {EventType, typeToInteger} from "../shop/shared/model/event-type";
import {ShopItemType} from "../shop/shared/model/shop-item-type";
import {LogInService} from "../shared/services/api/login.service";
import {map, mergeMap} from "rxjs/operators";
import {Observable, Subject} from "rxjs";
import {NOW} from "../util/util";
import {PageRequest} from "../shared/model/api/page-request";
import {Direction, Sort} from "../shared/model/api/sort";
import {Filter} from "../shared/model/api/filter";
import {HttpClient} from "@angular/common/http";
import {WindowService} from "../shared/services/window.service";

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
	onDestroy$ = new Subject<any>();

	heroImageUrl = "landing-page-hero-image";
	userIsLoggedOut$ = this.loginService.isLoggedInObservable()
		.pipe(map(it => !it));

	tours$: Observable<ShopEvent[]> = this.loginService.isLoggedInObservable()
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
		);
	tourExplanation: string = `Unsere Hauptattraktion! Zu jedem Auswärtsspiel unserer Profis veranstalten wir eine Fahrt mit Bus, Bahn, Auto oder Flugzeug,
	je nach Distanz. Getreu unserem Namen haben wir dabei bereits über 50.000 Meilen hinter uns gelegt.
	Teilnehmer der Touren können diese sagenumwobenen Meilen sammeln und sich auf unserer Meilentabelle mit anderen Mitgliedern
	um den ersten Platz streiten. Werde auch du Teil der Meilenwölfefamilie und melde dich für eine Tour an!`;


	partys$: Observable<ShopEvent[]> = this.loginService.isLoggedInObservable()
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
		);
	partyExplanation = `Außerhalb der Spiele des VfL Wolfsburg organisieren wir regelmäßig auch eigene Events, wie z.B. 
	den Montagskick oder einen Cocktailkurs. In dieser Kategorie findest du auch Vereinsveranstaltungen wie die jährliche Mitgliederversammlung 
	oder Weihnachtsfeiern.`;

	merch$: Observable<ShopEvent[]> = this.loginService.isLoggedInObservable()
		.pipe(
			mergeMap(() => this.eventService.get(
				Filter.by({
					"type": typeToInteger(EventType.merch) + ""
				}),
				PageRequest.first(7),
				Sort.by(Direction.ASCENDING, "date"))
			),
			map(it => it.content),
		);
	merchExplanation = `Du möchtest uns supporten, hast aber keine Zeit oder Lust, an Touren oder anderen Veranstaltungen teilzunehmen?
	Oder du hast einfach viel zu viel Geld und weißt nicht, wohin damit? Dann stöber doch mal durch unseren Merchandise Katalog!`

	constructor(private eventService: EventService,
				private http: HttpClient,
				private cdRef: ChangeDetectorRef,
				private windowService: WindowService,
				private loginService: LogInService) {
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
		this.onDestroy$.next(true);
	}
}
