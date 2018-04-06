import {Component, OnInit} from "@angular/core";
import {first, map} from "rxjs/operators";
import {Observable} from "rxjs/Observable";
import {ActivatedRoute, UrlSegment} from "@angular/router";
import {EventType} from "../../../shared/model/event-type";
import {Participant, ParticipantUser} from "../../../shared/model/participant";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {User} from "../../../../shared/model/user";
import {combineLatest} from "rxjs/observable/combineLatest";
import {ConcludeEventService} from "../../../shared/services/conclude-event.service";
import {NavigationService} from "../../../../shared/services/navigation.service";

@Component({
	selector: "memo-conclude-event",
	templateUrl: "./conclude-event.component.html",
	styleUrls: ["./conclude-event.component.scss"]
})
export class ConcludeEventComponent implements OnInit {
	//todo reactive..
	eventInfo: Observable<{
		eventType: EventType,
		eventId: number
	}> = this.activatedRoute.url
		.pipe(
			map((urls: UrlSegment[]) => {
				// "tours/:id/participants"
				// "partys/:id/participants"
				let eventType = EventType[urls[0].path];
				let eventId = +urls[1].path;

				return {eventType, eventId};
			})
		);

	participants$: BehaviorSubject<ParticipantUser[]> = new BehaviorSubject([]);
	groupImageFormData$: BehaviorSubject<FormData> = new BehaviorSubject(null);
	reportResponsibleUsers$: BehaviorSubject<User[]> = new BehaviorSubject([]);

	everythingDone$ = combineLatest(
		this.participants$,
		this.groupImageFormData$,
		this.reportResponsibleUsers$
	)
		.pipe(
			map(([participants, formData, responsibleUsers]) => {
				return formData !== null && responsibleUsers.length > 0;
			})
		);

	constructor(private activatedRoute: ActivatedRoute,
				private navigationService: NavigationService,
				private concludeEventService: ConcludeEventService) {
	}

	ngOnInit() {
	}

	/**
	 *
	 * @param {ParticipantUser[]} participants
	 */
	updateParticipants(participants: ParticipantUser[]) {
		this.participants$.next(participants);
	}

	/**
	 *
	 * @param {FormData} formData
	 */
	updateFormData(formData: FormData) {
		this.groupImageFormData$.next(formData);
	}


	updateResponsibleUsers(users: User[]) {
		this.reportResponsibleUsers$.next(users);
	}

	/**
	 *
	 */
	concludeEvent() {
		combineLatest(
			this.eventInfo,
			this.participants$,
			this.groupImageFormData$,
			this.reportResponsibleUsers$
		)
			.pipe(first())
			.subscribe(([eventInfo, participantUsers, groupImageFormData, responsibleUsers]) => {
				const participants: Participant[] = participantUsers
					.map(participantUser => {
						const {user, ...participant} = participantUser;
						return participant;
					});
				this.concludeEventService.concludeEvent(eventInfo.eventId, participants, groupImageFormData, responsibleUsers);

				this.navigationService.navigateToItemWithId(eventInfo.eventType, eventInfo.eventId);
			})
	}
}
