import {Component, OnDestroy, OnInit} from "@angular/core";
import {SelectionModel} from "@angular/cdk/collections";
import {ActivatedRoute, Router} from "@angular/router";
import {Observable, Subject} from "rxjs";
import {map, takeUntil} from "rxjs/operators";
import {EventType} from "../../../../../shared/model/event-type";

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

	constructor(private activatedRoute: ActivatedRoute,
				private router: Router) {
		this.selectionModel.changed.pipe(takeUntil(this.onDestroy$))
			.subscribe(changed => this.router.navigate([], {queryParams: {view: this.selectionModel.selected[0]}}))
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
