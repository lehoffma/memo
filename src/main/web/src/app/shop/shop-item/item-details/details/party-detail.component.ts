import {Component, OnDestroy, OnInit} from "@angular/core";
import {Party} from "../../../shared/model/party";
import {ActivatedRoute, Router} from "@angular/router";
import {Observable} from "rxjs";
import {EventOverviewKey} from "../container/overview/event-overview-key";
import {EventService} from "../../../../shared/services/api/event.service";
import {EventType} from "../../../shared/model/event-type";
import {ParticipantsService} from "../../../../shared/services/api/participants.service";
import {LogInService} from "../../../../shared/services/api/login.service";
import {Permission} from "../../../../shared/model/permission";
import {rolePermissions} from "../../../../shared/model/club-role";
import {CommentService} from "../../../../shared/services/api/comment.service";
import {Comment} from "../../../shared/model/comment";
import {EventUtilityService} from "../../../../shared/services/event-utility.service";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {of} from "rxjs/observable/of";
import {_throw} from "rxjs/observable/throw";
import {catchError, filter, first, map, mergeMap} from "rxjs/operators";
import {empty} from "rxjs/observable/empty";
import {combineLatest} from "rxjs/observable/combineLatest";


@Component({
	selector: "memo-party-details",
	templateUrl: "./party-detail.component.html",
	styles: [
		`
			.description{
				white-space: pre-wrap;
			}
		`
	]
})

export class PartyDetailComponent implements OnInit, OnDestroy{
	_party$: BehaviorSubject<Party> = new BehaviorSubject(Party.create());

	party$: Observable<Party> = this._party$
		.pipe(
			mergeMap(event => event === undefined || !EventUtilityService.isParty(event)
				? _throw(new Error())
				: of(event)),
			catchError(error => {
				this.router.navigateByUrl("page-not-found", {skipLocationChange: true, replaceUrl: true});
				return empty<Party>();
			})
		);

	overViewKeys$: Observable<EventOverviewKey[]> = this._party$
		.pipe(
			map(party => party.overviewKeys)
		);

	participants$ = this._party$
		.pipe(
			filter(party => party.id !== -1),
			mergeMap((party: Party) => this.participantService.getParticipantUsersByEvent(party.id, EventType.partys))
		);

	participantsLink$ = combineLatest(this._party$, this.loginService.currentUser$)
		.pipe(
			map(([party, user]) => {
				if (user !== null) {
					let permissions = user.permissions ? user.permissions : rolePermissions[user.clubRole];
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
				private participantService: ParticipantsService,
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

	ngOnDestroy(){
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

