import {Component, OnDestroy, OnInit} from "@angular/core";
import {Merchandise} from "../../../shared/model/merchandise";
import {ActivatedRoute, Router} from "@angular/router";
import {Observable} from "rxjs";
import {isNullOrUndefined} from "util";
import {MerchandiseOptions} from "./merchandise-options";
import {EventOverviewKey} from "../container/overview/event-overview-key";
import {EventService} from "../../../../shared/services/api/event.service";
import {CommentService} from "../../../../shared/services/api/comment.service";
import {Comment} from "../../../shared/model/comment";
import {BehaviorSubject} from "rxjs/Rx";
import {EventUtilityService} from "../../../../shared/services/event-utility.service";

@Component({
	selector: "memo-merchandise-details",
	templateUrl: "./merchandise-detail.component.html",
	styles: [`
		.table-size-clothes tr:nth-child(even) {
			background-color: #f2f2f2;

		}
		.description{
			white-space: pre-wrap;
		}
	`]
})
export class MerchandiseDetailComponent implements OnInit, OnDestroy {
	_merch$: BehaviorSubject<Merchandise> = new BehaviorSubject(Merchandise.create());

	merch$: Observable<Merchandise> = this._merch$
		.asObservable()
		.flatMap(event => event === undefined || !EventUtilityService.isMerchandise(event)
			? Observable.throw(new Error())
			: Observable.of(event))
		.catch(error => {
			this.router.navigateByUrl("page-not-found", {skipLocationChange: true, replaceUrl: true});
			return Observable.empty();
		});

	clothesSizes$: Observable<string[]> = this._merch$.map(merch => merch.clothesSizes);
	overViewKeys$: Observable<EventOverviewKey[]> = this._merch$.map(merch => merch.overviewKeys);
	comments$ = this._merch$
		.filter(merch => merch.id >= 0)
		.flatMap(merch => this.commentService.getByEventId(merch.id));
	options: MerchandiseOptions = {size: "", color: {name: "", hex: ""}};

	subscriptions = [];

	constructor(private route: ActivatedRoute,
				private router: Router,
				private commentService: CommentService,
				private eventService: EventService) {
		this.subscriptions[0] = this.route.params
			.flatMap(params => this.eventService.getById(+params["id"]))
			.subscribe((merch:Merchandise) => this._merch$.next(merch));
	}

	ngOnInit() {
		this.initialize();
	}

	ngOnDestroy(): void {
		this.subscriptions.forEach(it => it.unsubscribe());
	}

	initialize() {
		this.subscriptions[1] = this.clothesSizes$.filter(sizes => !this.options.size && sizes && sizes.length > 0)
			.subscribe(sizes => this.options.size = sizes[0]);

		this.subscriptions[2] = this._merch$
			.filter(merch => !isNullOrUndefined(merch))
			.map(merch => merch.colors)
			.filter(colors => !this.options.color && colors && colors.length > 0)
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
			.subscribe(result => {
				// console.log(result);
			})
	}
}
