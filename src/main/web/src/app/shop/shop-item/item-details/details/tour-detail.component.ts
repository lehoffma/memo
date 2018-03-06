import {Component, OnDestroy, OnInit} from "@angular/core";
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
import {EventUtilityService} from "../../../../shared/services/event-utility.service";
import {ParticipantUser} from "../../../shared/model/participant";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {catchError, filter, first, map, mergeMap} from "rxjs/operators";
import {of} from "rxjs/observable/of";
import {_throw} from "rxjs/observable/throw";
import {empty} from "rxjs/observable/empty";
import {combineLatest} from "rxjs/observable/combineLatest";


@Component({
	selector: "memo-tour-details",
	templateUrl: "./tour-detail.component.html",
	styles: [
			`
			.description {
				white-space: pre-wrap;
			}

			memo-route-list {
				display: block;
				border-bottom: 1px solid #ededed;
				margin: -1rem -1rem 1rem;
				padding: 0 1rem;
			}

			memo-comments-section {
				width: 100%;
			}

			@media all and (min-width: 1050px) {
				memo-route-list {
					width: calc(50% + 2rem);
					background: white;
					border-right: 1px solid #ededed;
					border-bottom: none;
					margin-bottom: -1rem;
					height: 410px;
					overflow-y: auto;
				}

				memo-item-details-content /deep/ .object-details-content {
					display: flex;
				}

				memo-route-map {
					width: 50%;
					margin-left: 2rem;
				}
			}
		`
	]
})
export class TourDetailComponent implements OnInit, OnDestroy {

	_tour$: BehaviorSubject<Tour> = new BehaviorSubject(Tour.create());

	tour$: Observable<Tour> = this._tour$
		.pipe(
			mergeMap(event => event === undefined || !EventUtilityService.isTour(event)
				? _throw(new Error())
				: of(event)),
			catchError(error => {
				this.router.navigateByUrl("page-not-found", {skipLocationChange: true, replaceUrl: true});
				return empty<Tour>();
			})
		);

	overViewKeys$: Observable<EventOverviewKey[]> = this._tour$
		.pipe(
			map(tour => tour.overviewKeys)
		);

	tourRoute$ = this._tour$
		.pipe(
			map(tour => tour.route),
		);

	participants$ = this._tour$
		.pipe(
			filter(party => party.id !== -1),
			mergeMap((tour: Tour) => this.participantService.getParticipantUsersByEvent(tour.id, EventType.tours)),
			//remove duplicate entries
			map((participants: ParticipantUser[]) => participants.reduce((acc: ParticipantUser[], user) => {
				const index = acc.find(it => it.user.id === user.user.id);
				return index === undefined ? [...acc, user] : acc;
			}, []))
		);

	participantsLink$ = combineLatest(this._tour$, this.loginService.currentUser$)
		.pipe(
			map(([tour, user]) => {
				if (user !== null) {
					let permissions = user.permissions ? user.permissions : rolePermissions[user.clubRole];
					return permissions.tour >= Permission.write
						? "/tours/" + tour.id + "/participants"
						: null
				}
				return null;
			})
		);

	comments$ = this._tour$
		.pipe(
			filter(tour => tour.id >= 0),
			mergeMap(tour => this.commentService.getByEventId(tour.id))
		);

	commentsSubject$ = new BehaviorSubject<Comment[]>([]);

	subscriptions = [];

	constructor(private activatedRoute: ActivatedRoute,
				private router: Router,
				private participantService: ParticipantsService,
				private loginService: LogInService,
				private commentService: CommentService,
				private addressService: AddressService,
				private eventService: EventService) {
		console.log(this.activatedRoute);
		this.subscriptions.push(
			this.comments$.subscribe(this.commentsSubject$)
		);
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

	/**
	 *
	 * @param {Comment} comment
	 * @param {number} parentId
	 */
	deleteComment({comment, parentId}: { comment: Comment, parentId: number }) {
		this.commentService.remove(comment.id, parentId)
			.pipe(
				mergeMap(() => this._tour$),
				filter(tour => tour.id >= 0),
				mergeMap(tour => this.commentService.getByEventId(tour.id)),
				first()
			)
			.subscribe(this.commentsSubject$);
	}
}
