import {Component, OnInit} from "@angular/core";
import {Merchandise} from "../../../shared/model/merchandise";
import {ActivatedRoute} from "@angular/router";
import {Observable} from "rxjs";
import {isNullOrUndefined} from "util";
import {MerchandiseOptions} from "./merchandise-options";
import {EventOverviewKey} from "../../item-details/container/overview/event-overview-key";
import {EventService} from "../../../../shared/services/event.service";
import {CommentService} from "../../../../shared/services/comment.service";
import {LogInService} from "../../../../shared/services/login.service";
import {Comment} from "../../../shared/model/comment";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

@Component({
	selector: "memo-merchandise-details",
	templateUrl: "./merchandise-detail.component.html",
	styleUrls: ["./merchandise-detail.component.scss"]
})
export class MerchandiseDetailComponent implements OnInit {
	merch$: Observable<Merchandise> = this.route.params
		.flatMap(params => this.eventService.getById(+params["id"]));
	clothesSizes$: Observable<string[]> = this.merch$.map(merch => merch.clothesSizes);
	overViewKeys$: Observable<EventOverviewKey[]> = this.merch$.map(merch => merch.overviewKeys);

	options: MerchandiseOptions = {size: "", color: {name: "", hex: ""}};

	comments$ = this.merch$
		.do(changes => console.log(changes))
		.filter(merch => merch.id >= 0)
		.flatMap(merch => this.commentService.getByEventId(merch.id));

	commentsSubject$ = new BehaviorSubject<Comment[]>([]);

	constructor(private route: ActivatedRoute,
				private commentService: CommentService,
				private loginService: LogInService,
				private eventService: EventService) {

	}

	ngOnInit() {
		this.initialize();
		this.comments$.subscribe(comments => this.commentsSubject$.next(comments));
	}

	initialize() {
		this.clothesSizes$.filter(sizes => !this.options.size && sizes && sizes.length > 0)
			.subscribe(sizes => this.options.size = sizes[0]);

		this.merch$
			.filter(merch => !isNullOrUndefined(merch))
			.map(merch => merch.colors)
			.filter(colors => !this.options.color && colors && colors.length > 0)
			.subscribe(colors => this.options.color = colors[0]);
	}



	/**
	 *
	 * @param commentText
	 * @param parentId
	 */
	addComment({commentText, parentId}){
		Observable.combineLatest(this.loginService.currentUser(), this.merch$)
			.subscribe(([user, merch]) => {
				let comment = new Comment(merch.id, -1, new Date(), user.id, commentText);
				this.commentService.add(comment, parentId)
					.subscribe(addResult => {
						this.merch$
							.filter(tour => tour.id >= 0)
							.flatMap(tour => this.commentService.getByEventId(tour.id))
							.first()
							.subscribe(comments => {
								this.commentsSubject$.next(comments);
							})
					}, error => {
						console.error("adding the comment went wrong");
					})
			})
	}

	deleteComment({comment, parentId}: { comment: Comment, parentId: number }) {
		this.commentService.remove(comment.id, parentId)
			.subscribe(result => {
				//todo das reloaded alles immer, lieber am anfang direkt die kommentare in die childs rein laden statt ids
				//dann kann man auch vernünftig kommentare löschen lokal...
				this.merch$
					.filter(tour => tour.id >= 0)
					.flatMap(tour => this.commentService.getByEventId(tour.id))
					.first()
					.subscribe(comments => {
						this.commentsSubject$.next(comments);
					})
			})
	}
}
