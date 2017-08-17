import {Component, OnInit} from "@angular/core";
import {Party} from "../../../shared/model/party";
import {ActivatedRoute} from "@angular/router";
import {Observable} from "rxjs";
import {EventOverviewKey} from "../../item-details/container/overview/event-overview-key";
import {EventService} from "../../../../shared/services/event.service";
import {EventType} from "../../../shared/model/event-type";
import {ParticipantsService} from "../../../../shared/services/participants.service";
import {LogInService} from "../../../../shared/services/login.service";
import {Permission} from "../../../../shared/model/permission";
import {rolePermissions} from "../../../../shared/model/club-role";
import {CommentService} from "../../../../shared/services/comment.service";
import {Comment} from "../../../shared/model/comment";
import {BehaviorSubject} from "rxjs/BehaviorSubject";


@Component({
	selector: "memo-party-details",
	templateUrl: "./party-detail.component.html",
	styleUrls: ["./party-detail.component.scss"]
})

export class PartyDetailComponent implements OnInit {
	party$: Observable<Party> = this.route.params
		.flatMap(params => this.eventService.getById(+params["id"]));

	overViewKeys$: Observable<EventOverviewKey[]> = this.party$.map(party => party.overviewKeys);

	participants$ = this.party$
		.flatMap((party: Party) => this.participantService.getParticipantUsersByEvent(party.id, EventType.partys));

	participantsLink$ = Observable.combineLatest(this.party$, this.loginService.currentUser())
		.map(([party, user]) => {
			if (user !== null) {
				let permissions = user.permissions ? user.permissions : rolePermissions[user.clubRole];
				return permissions.party >= Permission.write
					? "/partys/" + party.id + "/participants"
					: null
			}
			return null;
		});

	comments$ = this.party$
		.filter(party => party.id >= 0)
		.flatMap(party => this.commentService.getByEventId(party.id));

	commentsSubject$ = new BehaviorSubject<Comment[]>([]);

	constructor(private route: ActivatedRoute,
				private participantService: ParticipantsService,
				private commentService: CommentService,
				private loginService: LogInService,
				private eventService: EventService) {

	}

	ngOnInit() {
		this.comments$.subscribe(comments => this.commentsSubject$.next(comments));
	}

	/**
	 *
	 * @param commentText
	 * @param parentId
	 */
	addComment({commentText, parentId}) {
		Observable.combineLatest(this.loginService.currentUser(), this.party$)
			.subscribe(([user, party]) => {
				let comment = new Comment(party.id, -1, new Date(), user.id, commentText);
				this.commentService.add(comment, parentId)
					.subscribe(addResult => {
						this.party$
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
				this.party$
					.filter(tour => tour.id >= 0)
					.flatMap(tour => this.commentService.getByEventId(tour.id))
					.first()
					.subscribe(comments => {
						this.commentsSubject$.next(comments);
					})
			})
	}
}

