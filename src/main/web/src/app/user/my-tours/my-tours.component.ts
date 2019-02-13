import {Component, OnDestroy, OnInit} from "@angular/core";
import {LogInService} from "../../shared/services/api/login.service";
import {EventService} from "../../shared/services/api/event.service";
import {OrderedItemService} from "../../shared/services/api/ordered-item.service";
import {BehaviorSubject, combineLatest, EMPTY, Observable, Subscription} from "rxjs";
import {debounceTime, distinctUntilChanged, filter, map, switchMap} from "rxjs/operators";
import {ActivatedRoute, Router} from "@angular/router";
import {Filter} from "../../shared/model/api/filter";
import {PageRequest} from "../../shared/model/api/page-request";
import {Direction, Sort} from "../../shared/model/api/sort";
import {Event} from "../../shop/shared/model/event";
import {MatTab} from "@angular/material";
import {EventType, typeToInteger} from "../../shop/shared/model/event-type";

@Component({
	selector: "memo-my-tours",
	templateUrl: "./my-tours.component.html",
	styleUrls: ["./my-tours.component.scss"]
})
export class MyToursComponent implements OnInit, OnDestroy {
	subscriptions: Subscription[] = [];
	selectedView$: BehaviorSubject<string> = new BehaviorSubject("participated");
	selectedTime$: BehaviorSubject<string> = new BehaviorSubject("future");
	readonly NOW = new Date().toISOString();

	public events$: Observable<Event[]> = combineLatest(
		this.selectedView$,
		this.selectedTime$,
		this.loginService.accountObservable
	)
		.pipe(
			distinctUntilChanged(),
			debounceTime(250),
			switchMap(([selectedView, selectedTime, accountId]) => {
				console.log([selectedView, selectedTime, accountId]);
				if (accountId === null) {
					return EMPTY
				}

				let sort = Sort.by(Direction.ASCENDING, "date");
				let additionalFilter = Filter.by({"minDate": this.NOW});

				if (selectedTime === "past") {
					sort = Sort.by(Direction.DESCENDING, "date");
					additionalFilter = Filter.by({"maxDate": this.NOW});
				}

				if (selectedView === "participated") {
					return this.participantService.getParticipatedEventsOfUser(
						accountId,
						PageRequest.first(),
						sort,
						additionalFilter
					)
				} else {
					return this.eventService.get(
						Filter.combine(
							Filter.by({
								"authorId": "" + accountId,
								"type": typeToInteger(EventType.tours) + "," + typeToInteger(EventType.partys)
							}),
							additionalFilter
						),
						PageRequest.first(),
						sort
					);
				}

			}),
			map(it => it.content)
		);


	constructor(private loginService: LogInService,
				private participantService: OrderedItemService,
				private router: Router,
				private activatedRoute: ActivatedRoute,
				private eventService: EventService) {

		this.subscriptions.push(
			this.activatedRoute.queryParamMap
				.pipe(
					filter(map => map.has("view"))
				)
				.subscribe(queryParamMap => {
					if (queryParamMap.has("view")) {
						this.selectedView$.next(queryParamMap.get("view"));
					}
					if (queryParamMap.has("time")) {
						this.selectedTime$.next(queryParamMap.get("time"));
					}
				})
		);
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(it => it.unsubscribe());
	}


	updateView(tab: MatTab) {
		const view = (tab && tab.textLabel === "Teilgenommen") ? "participated" : "created";

		this.router.navigate([], {
			queryParams: {
				view: view,
			},
			queryParamsHandling: "merge",
			relativeTo: this.activatedRoute,
			replaceUrl: !this.activatedRoute.snapshot.queryParamMap.has("view")
		});
	}

	updateTime(time: string) {
		if(!time){
			time = "future";
		}
		this.router.navigate([], {
			queryParams: {
				time: time.toString(),
			},
			queryParamsHandling: "merge",
			relativeTo: this.activatedRoute,
			replaceUrl: !this.activatedRoute.snapshot.queryParamMap.has("view")
		});
	}
}
