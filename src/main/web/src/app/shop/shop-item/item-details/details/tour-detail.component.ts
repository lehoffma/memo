import {Component, OnDestroy, OnInit} from "@angular/core";
import {createTour, Tour} from "../../../shared/model/tour";
import {ActivatedRoute, Router} from "@angular/router";
import {EventService} from "../../../../shared/services/api/event.service";
import {OrderedItemService} from "../../../../shared/services/api/ordered-item.service";
import {AddressService} from "../../../../shared/services/api/address.service";
import {LogInService} from "../../../../shared/services/api/login.service";
import {CommentService} from "../../../../shared/services/api/comment.service";
import {EventUtilityService} from "../../../../shared/services/event-utility.service";
import {BehaviorSubject, EMPTY, Observable, of, throwError} from "rxjs";
import {catchError, mergeMap} from "rxjs/operators";


@Component({
	selector: "memo-tour-details",
	templateUrl: "./tour-detail.component.html",
	styles: []
})
export class TourDetailComponent implements OnInit, OnDestroy {

	_tour$: BehaviorSubject<Tour> = new BehaviorSubject(createTour());

	tour$: Observable<Tour> = this._tour$
		.pipe(
			mergeMap(event => event === undefined || !EventUtilityService.isTour(event)
				? throwError(new Error())
				: of(event)),
			catchError(error => {
				this.router.navigateByUrl("page-not-found", {skipLocationChange: true, replaceUrl: true});
				return EMPTY;
			})
		);

	subscriptions = [];

	constructor(private activatedRoute: ActivatedRoute,
				private router: Router,
				private participantService: OrderedItemService,
				private loginService: LogInService,
				private commentService: CommentService,
				private addressService: AddressService,
				private eventService: EventService) {
		this.subscriptions.push(
			this.activatedRoute.params
				.pipe(
					mergeMap(params => this.eventService.getById(+params["id"]))
				)
				.subscribe(this._tour$)
		);
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(it => it.unsubscribe());
	}

}
