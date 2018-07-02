import {Component, OnDestroy, OnInit} from "@angular/core";
import {createMerch, Merchandise} from "../../../shared/model/merchandise";
import {ActivatedRoute, Router} from "@angular/router";
import {EventService} from "../../../../shared/services/api/event.service";
import {CommentService} from "../../../../shared/services/api/comment.service";
import {EventUtilityService} from "../../../../shared/services/event-utility.service";
import {BehaviorSubject, EMPTY, Observable, of, throwError} from "rxjs";
import {catchError, mergeMap} from "rxjs/operators";

@Component({
	selector: "memo-merchandise-details",
	templateUrl: "./merchandise-detail.component.html",
	styles: []
})
export class MerchandiseDetailComponent implements OnInit, OnDestroy {
	_merch$: BehaviorSubject<Merchandise> = new BehaviorSubject(createMerch());

	merch$: Observable<Merchandise> = this._merch$
		.asObservable()
		.pipe(
			mergeMap(event => event === undefined || !EventUtilityService.isMerchandise(event)
				? throwError(new Error())
				: of(event)),
			catchError(error => {
				this.router.navigateByUrl("page-not-found", {skipLocationChange: true, replaceUrl: true});
				return EMPTY;
			})
		);

	subscriptions = [];

	constructor(private route: ActivatedRoute,
				private router: Router,
				private commentService: CommentService,
				private eventService: EventService) {
		this.subscriptions[0] = this.route.params
			.pipe(
				mergeMap(params => this.eventService.getById(+params["id"]))
			)
			.subscribe(this._merch$);
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(it => it.unsubscribe());
	}
}
