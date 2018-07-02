import {Component, OnDestroy, OnInit} from "@angular/core";
import {map, mergeMap} from "rxjs/operators";
import {combineLatest, Observable, of} from "rxjs";
import {ActivatedRoute, UrlSegment} from "@angular/router";
import {EventType} from "../../../shared/model/event-type";
import {ParticipantUser} from "../../../shared/model/participant";
import {ConcludeEventService} from "../../../shared/services/conclude-event.service";
import {NavigationService} from "../../../../shared/services/navigation.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {EventService} from "../../../../shared/services/api/event.service";
import {UserService} from "../../../../shared/services/api/user.service";
import {Event} from "../../../shared/model/event";
import {OrderedItemService} from "../../../../shared/services/api/ordered-item.service";
import {ImageToUpload} from "../../../../shared/utility/multi-image-upload/image-to-upload";
import {PageRequest} from "../../../../shared/model/api/page-request";
import {Direction, Sort} from "../../../../shared/model/api/sort";

@Component({
	selector: "memo-conclude-event",
	templateUrl: "./conclude-event.component.html",
	styleUrls: ["./conclude-event.component.scss"]
})
export class ConcludeEventComponent implements OnInit, OnDestroy {
	loading = false;
	formGroup: FormGroup = this.formBuilder.group({
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
			let participants$ = this.participantsService.getParticipantUsersByEvent(
				event.id,
				PageRequest.first(10000),
				Sort.by(Direction.ASCENDING, "id")
			).pipe(
				map(it => it.content)
			);

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
	}

	ngOnDestroy(): void {
		if (this.subscription) {
			this.subscription.unsubscribe();
		}
	}


	/**
	 *
	 */
	submit() {
		this.loading = true;
		this.event$
			.pipe(
				mergeMap(event => {
					//don't perform the PUT request for the group picture if it hasn't been changed
					const image: ImageToUpload = this.formGroup.get("images").get("imagesToUpload").value[0];
					const responsible = [...this.formGroup.get("responsibleUsers").value];

					return this.concludeEventService.concludeEvent(event.id, image, responsible);
				})
			)
			.subscribe(event => {
				this.loading = false;
				this.navigationService.navigateToItem(event);
			});
	}

}
