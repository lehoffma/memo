import {Injectable} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {of} from "rxjs/observable/of";
import {UserService} from "../../../shared/services/api/user.service";
import {EventService} from "../../../shared/services/api/event.service";
import {User} from "../../../shared/model/user";
import {map} from "rxjs/operators";

@Injectable()
export class ResponsibilityService {

	constructor(private userService: UserService,
				private eventService: EventService) {
	}


	/**
	 * Checks whether the given user is responsible for the given event
	 * @param {number} eventId
	 * @param {number} userId
	 * @returns {Observable<boolean>}
	 */
	public isResponsible(eventId: number, userId: number): Observable<boolean> {
		//todo remove demo
		return of(true);
	}

	/**
	 * Returns an observable containing the list of responsible users of the requested event
	 * @param {number} eventId
	 * @returns {Observable<User[]>}
	 */
	public getResponsible(eventId: number): Observable<User[]> {
		//todo remove demo
		return this.userService.getById(1).pipe(map(it => [it]));
	}

	/**
	 * Sets the given users as the responsible persons of the given event
	 * @param {number} eventId
	 * @param responsibleUsers
	 */
	public setAsResponsible(eventId: number, responsibleUsers: number[]) {
		//todo eventService.modifyEvent(id)
	}
}
