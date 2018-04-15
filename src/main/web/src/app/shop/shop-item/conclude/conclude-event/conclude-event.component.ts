import {Component, OnDestroy, OnInit} from "@angular/core";
import {map, mergeMap} from "rxjs/operators";
import {Observable} from "rxjs/Observable";
import {ActivatedRoute, UrlSegment} from "@angular/router";
import {EventType} from "../../../shared/model/event-type";
import {Participant, ParticipantUser} from "../../../shared/model/participant";
import {combineLatest} from "rxjs/observable/combineLatest";
import {ConcludeEventService} from "../../../shared/services/conclude-event.service";
import {NavigationService} from "../../../../shared/services/navigation.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {EventService} from "../../../../shared/services/api/event.service";
import {of} from "rxjs/observable/of";
import {UserService} from "../../../../shared/services/api/user.service";
import {Event} from "../../../shared/model/event";
import {OrderedItemService} from "../../../../shared/services/api/ordered-item.service";
import {ImageToUpload} from "../../../../shared/utility/multi-image-upload/image-to-upload";

@Component({
	selector: "memo-conclude-event",
	templateUrl: "./conclude-event.component.html",
	styleUrls: ["./conclude-event.component.scss"]
})
export class ConcludeEventComponent implements OnInit, OnDestroy {
	loading = false;
	formGroup: FormGroup = this.formBuilder.group({
		"participants": [[]],
		"images": this.formBuilder.group({
			"imagePaths": [],
			"imagesToUpload": [[]]
		}),
		"responsibleUsers": [[], {
			validators: [Validators.required]
		}]
	});

	eventInfo$: Observable<{
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

	event$ = this.eventInfo$.pipe(
		mergeMap(info => this.eventService.getById(info.eventId))
	);

	previousValue$: Observable<{ images: string[], participants: ParticipantUser[], responsible: number[] }> = this.event$.pipe(
		mergeMap((event: Event) => {
			let images$ = of(event.groupPicture ? [event.groupPicture] : []);
			let users$ = of([]);
			let participants$ = this.participantsService.getParticipantUsersByEvent(event.id);

			if (event.reportWriters.length > 0) {
				users$ = combineLatest(
					...event.reportWriters.map(id => this.userService.getById(id))
				);
			}

			return combineLatest(
				images$,
				participants$,
				users$
			)
				.pipe(
					map(([images, participants, users]) => ({
						images: images,
						participants: participants,
						responsible: users.map(it => it.id)
					}))
				)
		})
	);

	subscription = null;

	constructor(private activatedRoute: ActivatedRoute,
				private formBuilder: FormBuilder,
				private eventService: EventService,
				private userService: UserService,
				private participantsService: OrderedItemService,
				private navigationService: NavigationService,
				private concludeEventService: ConcludeEventService) {
	}

	ngOnInit() {
		this.subscription = this.previousValue$.subscribe(value => {
			this.updateParticipants(value.participants);
		})
	}

	ngOnDestroy(): void {
		if (this.subscription) {
			this.subscription.unsubscribe();
		}
	}

	/**
	 *
	 * @param {ParticipantUser[]} participants
	 */
	updateParticipants(participants: ParticipantUser[]) {
		this.formGroup.get("participants").setValue(participants);
	}


	/**
	 *
	 */
	submit() {
		this.loading = true;
		this.event$
			.pipe(
				mergeMap(event => {
					const participants: Participant[] = this.formGroup.get("participants").value
						.map(participantUser => {
							const {user, ...participant} = participantUser;
							return participant;
						});
					//don't perform the PUT request for the group picture if it hasn't been changed
					const image: ImageToUpload = this.formGroup.get("images").get("imagesToUpload").value[0];
					const responsible = [...this.formGroup.get("responsibleUsers").value];

					return this.concludeEventService.concludeEvent(event.id, participants, image, responsible);
				})
			)
			.subscribe(event => {
				this.loading = false;
				this.navigationService.navigateToItem(event);
			});
	}

}
