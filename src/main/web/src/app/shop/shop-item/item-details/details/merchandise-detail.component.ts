import {Component, OnDestroy, OnInit} from "@angular/core";
import {Merchandise} from "../../../shared/model/merchandise";
import {ActivatedRoute, Router} from "@angular/router";
import {isNullOrUndefined} from "util";
import {MerchandiseOptions} from "./merchandise-options";
import {EventOverviewKey} from "../container/overview/event-overview-key";
import {EventService} from "../../../../shared/services/api/event.service";
import {CommentService} from "../../../../shared/services/api/comment.service";
import {Comment} from "../../../shared/model/comment";
import {EventUtilityService} from "../../../../shared/services/event-utility.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {catchError, filter, map, mergeMap} from "rxjs/operators";
import {of} from "rxjs/observable/of";
import {_throw} from "rxjs/observable/throw";
import {empty} from "rxjs/observable/empty";
import {Observable} from "rxjs/Observable";

@Component({
	selector: "memo-merchandise-details",
	templateUrl: "./merchandise-detail.component.html",
	styles: [`
		.table-size-clothes tr:nth-child(even) {
			background-color: #f2f2f2;

		}

		memo-comments-section {
			width: 100%;
		}

		.description {
			white-space: pre-wrap;
		}
	`]
})
export class MerchandiseDetailComponent implements OnInit, OnDestroy {
	_merch$: BehaviorSubject<Merchandise> = new BehaviorSubject(Merchandise.create());

	merch$: Observable<Merchandise> = this._merch$
		.asObservable()
		.pipe(
			mergeMap(event => event === undefined || !EventUtilityService.isMerchandise(event)
				? _throw(new Error())
				: of(event)),
			catchError(error => {
				this.router.navigateByUrl("page-not-found", {skipLocationChange: true, replaceUrl: true});
				return empty<Merchandise>();
			})
		);

	clothesSizes$: Observable<string[]> = this._merch$
		.pipe(map(merch => merch.clothesSizes));
	overViewKeys$: Observable<EventOverviewKey[]> = this._merch$
		.pipe(map(merch => merch.overviewKeys));
	comments$ = this._merch$
		.pipe(
			filter(merch => merch.id >= 0),
			mergeMap(merch => this.commentService.getByEventId(merch.id))
		);
	options: MerchandiseOptions = {size: "", color: {name: "", hex: ""}};

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
		this.initialize();
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(it => it.unsubscribe());
	}

	initialize() {
		this.subscriptions[1] = this.clothesSizes$
			.pipe(
				filter(sizes => !this.options.size && sizes && sizes.length > 0)
			)
			.subscribe(sizes => this.options.size = sizes[0]);

		this.subscriptions[2] = this._merch$
			.pipe(
				filter(merch => !isNullOrUndefined(merch)),
				map(merch => merch.colors),
				filter(colors => !this.options.color && colors && colors.length > 0)
			)
			.subscribe(colors => this.options.color = colors[0]);

		// this.subscriptions = [
		// 	this.merch$.subscribe(),
		// 	this.comments$.subscribe(),
		// 	this.overViewKeys$.subscribe(),
		// 	this.clothesSizes$.subscribe()
		// ]
	}


	deleteComment({comment, parentId}: { comment: Comment, parentId: number }) {
		this.commentService.remove(comment.id, parentId)
			.subscribe()
	}
}
