import {Component, OnDestroy, OnInit} from "@angular/core";
import {Tour} from "../../../shared/model/tour";
import {ActivatedRoute, Router} from "@angular/router";
import {EventOverviewKey} from "../container/overview/event-overview-key";
import {EventService} from "../../../../shared/services/api/event.service";
import {OrderedItemService} from "../../../../shared/services/api/ordered-item.service";
import {AddressService} from "../../../../shared/services/api/address.service";
import {LogInService} from "../../../../shared/services/api/login.service";
import {Permission} from "../../../../shared/model/permission";
import {CommentService} from "../../../../shared/services/api/comment.service";
import {Comment} from "../../../shared/model/comment";
import {EventUtilityService} from "../../../../shared/services/event-utility.service";
import {ParticipantUser} from "../../../shared/model/participant";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {catchError, filter, map, mergeMap} from "rxjs/operators";
import {of} from "rxjs/observable/of";
import {_throw} from "rxjs/observable/throw";
import {combineLatest} from "rxjs/observable/combineLatest";
import {Observable} from "rxjs/Observable";
import {Address} from "../../../../shared/model/address";
import {EMPTY} from "rxjs/internal/observable/empty";
import {PageRequest} from "../../../../shared/model/api/page-request";
import {Sort} from "../../../../shared/model/api/sort";
import {PagedDataSource} from "../../../../shared/utility/material-table/paged-data-source";
import {Filter} from "../../../../shared/model/api/filter";


@Component({
	selector: "memo-tour-details",
	templateUrl: "./tour-detail.component.html",
	styles: [
			`
			.description {
				white-space: pre-wrap;
			}

			/*todo remove*/
			:host /deep/ .item-details-parent-container {
				margin-bottom: 8rem !important;
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

				memo-item-details-content:not(#participants-wrapper) /deep/ .object-details-content {
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
				return EMPTY;
			})
		);

	overViewKeys$: Observable<EventOverviewKey[]> = this._tour$
		.pipe(
			map(tour => tour.overviewKeys)
		);

	tourRoute$: Observable<Address[]> = this._tour$
		.pipe(
			map(tour => tour.route),
			mergeMap(ids => combineLatest(
				...ids.map(id => this.addressService.getById(id))
			))
		);

	participants$ = this._tour$
		.pipe(
			filter(party => party.id !== -1),
			mergeMap((tour: Tour) => this.participantService.getParticipantUsersByEvent(tour.id, PageRequest.first(), Sort.none())),
			map(it => it.content),
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
					let permissions = user.userPermissions();
					return permissions.tour >= Permission.write
						? "/tours/" + tour.id + "/participants"
						: null
				}
				return null;
			})
		);

	//todo introduce paging to comments
	page$ = new BehaviorSubject(PageRequest.first());
	commentDataSource: PagedDataSource = new PagedDataSource(this.commentService);
	filter$ = this._tour$.pipe(
		filter(tour => tour.id >= 0),
		map(tour => Filter.by({"eventId": "" + tour.id}))
	);

	comments$ = this.commentDataSource.connect().pipe(
		map((it: Comment[]) => it.filter(comment => Comment.isComment(comment)))
	);

	subscriptions = [];

	constructor(private activatedRoute: ActivatedRoute,
				private router: Router,
				private participantService: OrderedItemService,
				private loginService: LogInService,
				private commentService: CommentService,
				private addressService: AddressService,
				private eventService: EventService) {
		this.commentDataSource.isExpandable = false;
		this.commentDataSource.filter$ = this.filter$;
		this.commentDataSource.setPage(this.page$);

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
		this.commentDataSource.disconnect(null);
	}

	/**
	 *
	 * @param {Comment} comment
	 * @param {number} parentId
	 */
	deleteComment({comment, parentId}: { comment: Comment, parentId: number }) {
		this.commentService.remove(comment.id, parentId)
			.subscribe(() => {
				this.commentDataSource.reload();
			});
	}
}
