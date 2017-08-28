import {Component, OnInit} from "@angular/core";
import {Merchandise} from "../../../shared/model/merchandise";
import {ActivatedRoute, Router} from "@angular/router";
import {Observable} from "rxjs";
import {isNullOrUndefined} from "util";
import {MerchandiseOptions} from "./merchandise-options";
import {EventOverviewKey} from "../../item-details/container/overview/event-overview-key";
import {EventService} from "../../../../shared/services/api/event.service";
import {CommentService} from "../../../../shared/services/api/comment.service";
import {LogInService} from "../../../../shared/services/api/login.service";
import {Comment} from "../../../shared/model/comment";
import {EventUtilityService} from "../../../../shared/services/event-utility.service";

@Component({
	selector: "memo-merchandise-details",
	templateUrl: "./merchandise-detail.component.html",
	styleUrls: ["./merchandise-detail.component.scss"]
})
export class MerchandiseDetailComponent implements OnInit {
	merch$: Observable<Merchandise> = this.route.params
		.flatMap(params => this.eventService.getById(+params["id"]))
		.flatMap(event => event === undefined || !EventUtilityService.isMerchandise(event)
			? Observable.throw(new Error())
			: Observable.of(event))
		.catch(error => this.router.navigateByUrl("page-not-found", {skipLocationChange: true, replaceUrl: true}));

	clothesSizes$: Observable<string[]> = this.merch$.map(merch => merch.clothesSizes);
	overViewKeys$: Observable<EventOverviewKey[]> = this.merch$.map(merch => merch.overviewKeys);
	comments$ = this.merch$
		.filter(merch => merch.id >= 0)
		.flatMap(merch => this.commentService.getByEventId(merch.id))
		.first();
	options: MerchandiseOptions = {size: "", color: {name: "", hex: ""}};

	constructor(private route: ActivatedRoute,
				private router: Router,
				private commentService: CommentService,
				private loginService: LogInService,
				private eventService: EventService) {

	}

	ngOnInit() {
		this.initialize();
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


	deleteComment({comment, parentId}: { comment: Comment, parentId: number }) {
		this.commentService.remove(comment.id, parentId)
			.subscribe(result => {
				// console.log(result);
			})
	}
}
