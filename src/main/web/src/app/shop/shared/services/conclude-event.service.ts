import {Injectable} from "@angular/core";
import {Observable} from "rxjs/Observable";
import {EventService} from "../../../shared/services/api/event.service";
import {Participant} from "../model/participant";
import {User} from "../../../shared/model/user";
import {ImageToUpload} from "../../../shared/multi-image-upload/image-to-upload";
import {map, mergeMap, tap} from "rxjs/operators";
import {isBefore} from "date-fns";
import {EventUtilityService} from "../../../shared/services/event-utility.service";
import {ImageUploadService} from "../../../shared/services/api/image-upload.service";
import {of} from "rxjs/observable/of";
import {Event} from "../model/event";

@Injectable()
export class ConcludeEventService {

	constructor(private eventService: EventService,
				private imageUploadService: ImageUploadService) {
	}

	/**
	 *
	 * @param {number} eventId
	 * @returns {Observable<boolean>}
	 */
	public isConcludeBannerShown(eventId: number): Observable<boolean> {
		return this.eventService.getById(eventId)
			.pipe(
				map(event => !EventUtilityService.isMerchandise(event) &&
					isBefore(event.date, new Date()) && event.reportWriters.length === 0)
			);
	}

	/**
	 *
	 * @param {Event} event
	 * @param {ImageToUpload} groupPicture
	 * @returns {any}
	 */
	private replaceGroupImage(event: Event, groupPicture: ImageToUpload) {
		console.log(groupPicture);
		if (!groupPicture) {
			return of(event);
		}

		return (event.groupPicture
				? this.imageUploadService.deleteImage(event.groupPicture)
					.pipe(map(() => event))
				: of(event)
		)
			.pipe(
				mergeMap(event => {
					let formData = new FormData();
					const blob = this.imageUploadService.dataURItoBlob(groupPicture.data);
					formData.append("file[]", blob, groupPicture.name);
					return this.imageUploadService.uploadImages(formData)
						.pipe(
							map(response => response.images),
							map(images => event.setProperties({
								groupPicture: images[0]
							}))
						)
				})
			)
	}

	/**
	 *
	 * @param {number} eventId
	 * @param {Participant[]} finalParticipants
	 * @param groupPicture
	 * @param {User[]} reportResponsibleUsers
	 */
	public concludeEvent(eventId: number, finalParticipants: Participant[],
						 groupPicture: ImageToUpload, reportResponsibleUsers: User[]): Observable<Event> {
		return this.eventService.getById(eventId)
			.pipe(
				mergeMap(event => this.replaceGroupImage(event, groupPicture)),
				tap(it => console.log(it.groupPicture)),
				map(event => event.setProperties({
					reportWriters: reportResponsibleUsers.map(it => it.id)
				})),
				tap(it => console.log(it)),
				mergeMap(event => this.eventService.modify(event))
			);
	}
}
