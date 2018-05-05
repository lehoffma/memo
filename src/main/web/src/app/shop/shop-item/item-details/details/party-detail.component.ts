import {Component, OnDestroy, OnInit} from "@angular/core";
import {Party} from "../../../shared/model/party";
import {ActivatedRoute, Router} from "@angular/router";
import {EventOverviewKey} from "../container/overview/event-overview-key";
import {EventService} from "../../../../shared/services/api/event.service";
import {EventType} from "../../../shared/model/event-type";
import {OrderedItemService} from "../../../../shared/services/api/ordered-item.service";
import {LogInService} from "../../../../shared/services/api/login.service";
import {Permission} from "../../../../shared/model/permission";
import {CommentService} from "../../../../shared/services/api/comment.service";
import {Comment} from "../../../shared/model/comment";
import {EventUtilityService} from "../../../../shared/services/event-utility.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {of} from "rxjs/observable/of";
import {_throw} from "rxjs/observable/throw";
import {catchError, filter, first, map, mergeMap} from "rxjs/operators";
import {empty} from "rxjs/observable/empty";
import {combineLatest} from "rxjs/observable/combineLatest";
import {AddressService} from "../../../../shared/services/api/address.service";
import {Observable} from "rxjs/Observable";
import {Address} from "app/shared/model/address";
import {ParticipantUser} from "../../../shared/model/participant";
import {EMPTY} from "rxjs";


@Component({
	selector: "memo-party-details",
	templateUrl: "./party-detail.component.html",
	styles: [
			`
			.description {
				white-space: pre-wrap;
			}

			memo-comments-section {
				width: 100%;
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

export class PartyDetailComponent implements OnInit, OnDestroy {
	_party$: BehaviorSubject<Party> = new BehaviorSubject(Party.create());

	party$: Observable<Party> = this._party$
		.pipe(
			mergeMap(event => event === undefined || !EventUtilityService.isParty(event)
				? _throw(new Error())
				: of(event)),
			catchError(error => {
				this.router.navigateByUrl("page-not-found", {skipLocationChange: true, replaceUrl: true});
				return EMPTY;
			})
		);

	overViewKeys$: Observable<EventOverviewKey[]> = this._party$
		.pipe(
			map(party => party.overviewKeys)
		);

	meetingPoint$: Observable<Address[]> = this._party$
		.pipe(
			map(party => party.route),
			mergeMap(ids => combineLatest(
				...ids.map(id => this.addressService.getById(id))
			))
		);

	participants$ = this._party$
		.pipe(
			filter(party => party.id !== -1),
			mergeMap((party: Party) => this.participantService.getParticipantUsersByEvent(party.id, EventType.partys)),
			//remove duplicate entries
			map((participants: ParticipantUser[]) => participants.reduce((acc: ParticipantUser[], user) => {
				const index = acc.find(it => it.user.id === user.user.id);
				return index === undefined ? [...acc, user] : acc;
			}, []))
		);

	participantsLink$ = combineLatest(this._party$, this.loginService.currentUser$)
		.pipe(
			map(([party, user]) => {
				if (user !== null) {
					let permissions = user.userPermissions();
					return permissions.party >= Permission.write
						? "/partys/" + party.id + "/participants"
						: null
				}
				return null;
			})
		);

	comments$ = this._party$
		.pipe(
			filter(party => party.id >= 0),
			mergeMap(party => this.commentService.getByEventId(party.id))
		);

	commentsSubject$ = new BehaviorSubject<Comment[]>([]);

	subscriptions = [];

	constructor(private route: ActivatedRoute,
				private router: Router,
				private addressService: AddressService,
				private participantService: OrderedItemService,
				private commentService: CommentService,
				private loginService: LogInService,
				private eventService: EventService) {

		this.subscriptions[0] = this.route.params
			.pipe(
				mergeMap(params => this.eventService.getById(+params["id"]))
			)
			.subscribe(this._party$);
	}

	ngOnInit() {
		this.subscriptions.push(this.comments$.subscribe(this.commentsSubject$));
	}

	ngOnDestroy() {
		this.subscriptions.forEach(it => it.unsubscribe());
	}

	deleteComment({comment, parentId}: { comment: Comment, parentId: number }) {
		this.commentService.remove(comment.id, parentId)
			.pipe(
				mergeMap(() => this._party$),
				filter(tour => tour.id >= 0),
				mergeMap(tour => this.commentService.getByEventId(tour.id)),
				first()
			)
			.subscribe(this.commentsSubject$);
	}
}

