import {Injectable} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {EventService} from "../../../shared/services/api/event.service";
import {of} from "rxjs/observable/of";
import {Event} from "../model/event";
import {Participant} from "../model/participant";
import {User} from "../../../shared/model/user";

@Injectable()
export class ConcludeEventService {

	constructor(private eventService: EventService) {
	}

	/**
	 *
	 * @param {number} eventId
	 * @returns {Observable<boolean>}
	 */
	public hasConcluded(eventId: number): Observable<boolean> {
		//todo check if the date is set + ask backend if group photo/responsible users was set

		//todo remove demo
		return of(false);
	}


	/**
	 *
	 * @param {number} eventId
	 * @param {Participant[]} finalParticipants
	 * @param groupImage
	 * @param {User[]} reportResponsibleUser
	 */
	public concludeEvent(eventId: number, finalParticipants: Participant[],
						 groupImage: any, reportResponsibleUser: User[]) {
		//todo: update participants of event
		//todo: upload image and set as first or last image of event
		//todo: via api: set users responsible for report, this should notify them via email/notification
		console.warn("concluding event not implemented yet");
	}
}
