import {Component, OnDestroy, OnInit} from "@angular/core";
import {LogInService} from "../../shared/services/api/login.service";
import {Tour} from "../../shop/shared/model/tour";
import {EventService} from "../../shared/services/api/event.service";
import {Party} from "../../shop/shared/model/party";
import {dateSortingFunction} from "../../util/util";
import {OrderedItemService} from "../../shared/services/api/ordered-item.service";
import {Observable} from "rxjs/Observable";
import {catchError, filter, map, mergeMap} from "rxjs/operators";
import {EventUtilityService} from "../../shared/services/event-utility.service";
import {Merchandise} from "../../shop/shared/model/merchandise";
import {ActivatedRoute, Router} from "@angular/router";
import {Subscription} from "rxjs/Subscription";
import {EMPTY} from "rxjs/internal/observable/empty";
import {Filter} from "../../shared/model/api/filter";
import {EventType, typeToInteger} from "../../shop/shared/model/event-type";
import {PageRequest} from "../../shared/model/api/page-request";
import {Sort, SortDirectionEnum} from "../../shared/model/api/sort";
import {Event} from "../../shop/shared/model/event";

@Component({
	selector: "memo-my-tours",
	templateUrl: "./my-tours.component.html",
	styleUrls: ["./my-tours.component.scss"]
})
export class MyToursComponent implements OnInit, OnDestroy {
	public createdTours$: Observable<Event[]> = this.loginService.accountObservable
		.pipe(
			mergeMap(accountId => accountId === null
				? EMPTY
				: this.eventService.get(
					Filter.by({
						"authorId": "" + accountId,
						"type": typeToInteger(EventType.tours) + "|" + typeToInteger(EventType.partys)
					}),
					PageRequest.first(),
					Sort.by(SortDirectionEnum.ASCENDING, "date")
				)),
			map(it => it.content)
		);

	public participatedTours$: Observable<Event[]> = this.loginService.accountObservable
		.pipe(
			mergeMap(accountId => accountId === null
				? EMPTY
				//todo
				: this.eventService.get(
					Filter.by({
						"authorId": "" + accountId,
						"type": typeToInteger(EventType.tours) + "|" + typeToInteger(EventType.partys)
					}),
					PageRequest.first(),
					Sort.by(SortDirectionEnum.ASCENDING, "date")
				)),
			map(it => it.content),
			catchError(error => {
				console.error(error);
				return EMPTY;
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
