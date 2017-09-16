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
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {EventUtilityService} from "../../../../shared/services/event-utility.service";


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
		.flatMap(event => event === undefined || !EventUtilityService.isParty(event)
			? Observable.throw(new Error())
			: Observable.of(event))
		.catch(error => this.router.navigateByUrl("page-not-found", {skipLocationChange: true, replaceUrl: true}));

	overViewKeys$: Observable<EventOverviewKey[]> = this._party$.map(party => party.overviewKeys);

	participants$ = this._party$
		.filter(party => party.id !== -1)
		.flatMap((party: Party) => this.participantService.getParticipantUsersByEvent(party.id, EventType.partys));

	participantsLink$ = Observable.combineLatest(this._party$, this.loginService.currentUser$)
		.map(([party, user]) => {
			if (user !== null) {
				let permissions = user.permissions ? user.permissions : rolePermissions[user.clubRole];
				return permissions.party >= Permission.write
					? "/partys/" + party.id + "/participants"
					: null
			}
			return null;
		});

	comments$ = this._party$
		.filter(party => party.id >= 0)
		.flatMap(party => this.commentService.getByEventId(party.id));

	commentsSubject$ = new BehaviorSubject<Comment[]>([]);

	subscriptions = [];

	constructor(private route: ActivatedRoute,
				private router: Router,
				private participantService: ParticipantsService,
				private commentService: CommentService,
				private loginService: LogInService,
				private eventService: EventService) {

		this.subscriptions[0] = this.route.params
			.flatMap(params => this.eventService.getById(+params["id"]))
			.subscribe((party: Party) => this._party$.next(party));
	}

	ngOnInit() {
		this.comments$.subscribe(comments => this.commentsSubject$.next(comments));
	}

	ngOnDestroy(){
		this.subscriptions.forEach(it => it.unsubscribe());
	}

	deleteComment({comment, parentId}: { comment: Comment, parentId: number }) {
		this.commentService.remove(comment.id, parentId)
			.subscribe(result => {
				this._party$
					.filter(tour => tour.id >= 0)
					.flatMap(tour => this.commentService.getByEventId(tour.id))
					.first()
					.subscribe(comments => {
						this.commentsSubject$.next(comments);
					})
			})
	}
}

