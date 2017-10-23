import {Component, OnInit} from "@angular/core";
import {Tour} from "../../../shared/model/tour";
import {ActivatedRoute, Router} from "@angular/router";
import {Observable} from "rxjs";
import {EventOverviewKey} from "../container/overview/event-overview-key";
import {EventService} from "../../../../shared/services/api/event.service";
import {EventType} from "../../../shared/model/event-type";
import {ParticipantsService} from "../../../../shared/services/api/participants.service";
import {AddressService} from "../../../../shared/services/api/address.service";
import {LogInService} from "../../../../shared/services/api/login.service";
import {Permission} from "../../../../shared/model/permission";
import {rolePermissions} from "../../../../shared/model/club-role";
import {CommentService} from "../../../../shared/services/api/comment.service";
import {Comment} from "../../../shared/model/comment";
import {BehaviorSubject} from "rxjs/Rx";
import {EventUtilityService} from "../../../../shared/services/event-utility.service";
import {ParticipantUser} from "../../../shared/model/participant";


@Component({
	selector: "memo-tour-details",
	templateUrl: "./tour-detail.component.html",
	styles: [
			`
			.description {
				white-space: pre-wrap;
			}
		`
	]
})
export class TourDetailComponent implements OnInit {
	_tour$: BehaviorSubject<Tour> = new BehaviorSubject(Tour.create());

	tour$: Observable<Tour> = this._tour$
		.flatMap(event => event === undefined || !EventUtilityService.isTour(event)
			? Observable.throw(new Error())
			: Observable.of(event))
		.catch(error => this.router.navigateByUrl("page-not-found", {skipLocationChange: true, replaceUrl: true}));

	overViewKeys$: Observable<EventOverviewKey[]> = this._tour$.map(tour => tour.overviewKeys);

	tourRoute$ = this._tour$
		.flatMap(tour => Observable.combineLatest(tour.route.map(addressId => this.addressService.getById(addressId))));

	participants$ = this._tour$
		.filter(party => party.id !== -1)
		.flatMap((tour: Tour) => this.participantService.getParticipantUsersByEvent(tour.id, EventType.tours))
		//remove duplicate entries
		.map((participants: ParticipantUser[]) => participants.reduce((acc: ParticipantUser[], user) => {
			const index = acc.find(it => it.user.id === user.user.id);
			return index === undefined ? [...acc, user] : acc;
		}, []));

	participantsLink$ = Observable.combineLatest(this._tour$, this.loginService.currentUser$)
		.map(([tour, user]) => {
			if (user !== null) {
				let permissions = user.permissions ? user.permissions : rolePermissions[user.clubRole];
				return permissions.tour >= Permission.write
					? "/tours/" + tour.id + "/participants"
					: null
			}
			return null;
		});

	comments$ = this._tour$
		.filter(tour => tour.id >= 0)
		.flatMap(tour => this.commentService.getByEventId(tour.id));

	commentsSubject$ = new BehaviorSubject<Comment[]>([]);

	subscriptions = [];

	constructor(private activatedRoute: ActivatedRoute,
				private router: Router,
				private participantService: ParticipantsService,
				private loginService: LogInService,
				private commentService: CommentService,
				private addressService: AddressService,
				private eventService: EventService) {
		this.comments$.subscribe(comments => this.commentsSubject$.next(comments));

		this.subscriptions[0] = this.activatedRoute.params
			.flatMap(params => this.eventService.getById(+params["id"]))
			.subscribe((tour: Tour) => this._tour$.next(tour));
	}

	ngOnInit() {
	}

	/**
	 *
	 * @param {Comment} comment
	 * @param {number} parentId
	 */
	deleteComment({comment, parentId}: { comment: Comment, parentId: number }) {
		this.commentService.remove(comment.id, parentId)
			.subscribe(response => {
				this._tour$
					.filter(tour => tour.id >= 0)
					.flatMap(tour => this.commentService.getByEventId(tour.id))
					.first()
					.subscribe(comments => {
						this.commentsSubject$.next(comments);
					})
			})
	}
}
