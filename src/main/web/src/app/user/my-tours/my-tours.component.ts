import {Component, OnDestroy, OnInit} from "@angular/core";
import {LogInService} from "../../shared/services/api/login.service";
import {Tour} from "../../shop/shared/model/tour";
import {EventService} from "../../shared/services/api/event.service";
import {Party} from "../../shop/shared/model/party";
import {dateSortingFunction} from "../../util/util";
import {OrderedItemService} from "../../shared/services/api/ordered-item.service";
import {empty} from "rxjs/observable/empty";
import {Observable} from "rxjs/Observable";
import {catchError, filter, map, mergeMap} from "rxjs/operators";
import {EventUtilityService} from "../../shared/services/event-utility.service";
import {Merchandise} from "../../shop/shared/model/merchandise";
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from "rxjs/Subscription";

@Component({
	selector: "memo-my-tours",
	templateUrl: "./my-tours.component.html",
	styleUrls: ["./my-tours.component.scss"]
})
export class MyToursComponent implements OnInit, OnDestroy {
	public createdTours$: Observable<(Tour | Party)[]> = this.loginService.accountObservable
		.pipe(
			mergeMap(accountId => accountId === null
				? empty()
				: this.eventService.getHostedEventsOfUser(accountId)),
			map((events: (Tour | Party | Merchandise)[]) =>
				events.filter(event => !EventUtilityService.isMerchandise(event))),
			map((events: (Tour | Party)[]) => {
				events.sort(dateSortingFunction<(Tour | Party)>(obj => obj.date, false));
				return events;
			})
		);

	public participatedTours$: Observable<(Tour | Party)[]> = this.loginService.accountObservable
		.pipe(
			mergeMap(accountId => accountId === null
				? empty<(Tour | Party)[]>()
				: this.participantService.getParticipatedEventsOfUser(accountId)),
			map((events: (Tour | Party)[]) => {
				events.sort(dateSortingFunction<(Tour | Party)>(obj => obj.date, false));
				return events;
			}),
			catchError(error => {
				console.error(error);
				return empty<(Tour | Party)[]>();
			})
		);

	//todo: past/future/all events filter dropdown
	//todo: search bar?

	selectedView: "participated" | "created" = "participated";
	subscriptions: Subscription[] = [];

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
					switch (queryParamMap.get("view")) {
						case "participated":
							this.selectedView = "participated";
							break;
						case "created":
							this.selectedView = "created";
							break;
						default:
							this.selectedView = "participated";
					}
				})
		);
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(it => it.unsubscribe());
	}


	navigateToRoute(selectedView: "participated" | "created") {
		this.router.navigate([], {
			queryParams: {
				view: selectedView.toString(),
			},
			relativeTo: this.activatedRoute,
			replaceUrl: !this.activatedRoute.snapshot.queryParamMap.has("view")
		});
	}


}
