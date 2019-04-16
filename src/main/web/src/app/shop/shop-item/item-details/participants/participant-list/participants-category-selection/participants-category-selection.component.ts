import {Component, OnDestroy, OnInit} from "@angular/core";
import {SelectionModel} from "@angular/cdk/collections";
import {ActivatedRoute, Router} from "@angular/router";
import {BehaviorSubject, combineLatest, Observable, Subject} from "rxjs";
import {map, switchMap, takeUntil} from "rxjs/operators";
import {EventType} from "../../../../../shared/model/event-type";
import {OrderedItemService} from "../../../../../../shared/services/api/ordered-item.service";
import {ParticipantState} from "../../../../../../shared/model/participant-state";
import {tap} from "rxjs/internal/operators/tap";
import {ParticipantListService} from "../participant-list.service";

export type ParticipantListOption = "participated" | "isDriver" | "needsTicket";

@Component({
	selector: "memo-participants-category-selection",
	templateUrl: "./participants-category-selection.component.html",
	styleUrls: ["./participants-category-selection.component.scss"]
})
export class ParticipantsCategorySelectionComponent implements OnInit, OnDestroy {
	selectionModel: SelectionModel<ParticipantListOption> = new SelectionModel<ParticipantListOption>(
		false,
		this.initiallySelectedValues()
	);

	onDestroy$ = new Subject();

	eventType$: Observable<EventType> = this.activatedRoute.url.pipe(
		map(urls => {
			// "tours/:id/participants"
			// "partys/:id/participants"
			//shop/partys/1/participants?page=1&pageSize=20
			return EventType[urls[1].path];
		})
	);

	loading$: BehaviorSubject<boolean> = new BehaviorSubject(false);
	state$: Observable<ParticipantState> = combineLatest(
		this.participantListService.loadCategoryStatsTrigger$,
		this.activatedRoute.queryParamMap.pipe(
			map(it => it.has("showCancelled") ? (it.get("showCancelled") === "true") : false)
		),
		this.activatedRoute.url.pipe(
			map(urls => urls[2].path)
		)
	).pipe(
		tap(it => this.loading$.next(true)),
		switchMap(([trigger, showCancelled, itemId]) => this.orderedItemService.getStateOfItem(itemId, showCancelled)),
		tap(it => this.loading$.next(false)),
	);

	constructor(private activatedRoute: ActivatedRoute,
				private participantListService: ParticipantListService,
				private orderedItemService: OrderedItemService,
				private router: Router) {
		this.selectionModel.changed.pipe(takeUntil(this.onDestroy$))
			.subscribe(changed => this.router.navigate([], {
				queryParams: {view: this.selectionModel.selected[0]},
				queryParamsHandling: "merge"
			}))
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
		this.onDestroy$.next(true);
	}

	private initiallySelectedValues(): ParticipantListOption[] {
		if (!this.activatedRoute.snapshot.queryParamMap.has("view")) {
			return ["participated"];
		}

		const view = this.activatedRoute.snapshot.queryParamMap.get("view");
		if (!(["participated", "isDriver", "needsTicket"].includes(view))) {
			return ["participated"];
		}

		return [view as any];
	}
}
