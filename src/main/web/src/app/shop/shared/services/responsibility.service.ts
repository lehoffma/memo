import {Injectable} from "@angular/core";
import {combineLatest, Observable} from "rxjs";
import {UserService} from "../../../shared/services/api/user.service";
import {EventService} from "../../../shared/services/api/event.service";
import {User} from "../../../shared/model/user";
import {map, mergeMap} from "rxjs/operators";

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
		return this.getResponsibleIds(eventId)
			.pipe(
				map(responsibleIds => !!responsibleIds.find(id => id === userId))
			);
	}

	/**
	 * Returns an observable containing the list of responsible users of the requested event
	 * @param {number} eventId
	 * @returns {Observable<number[]>}
	 */
	public getResponsibleIds(eventId: number): Observable<number[]> {
		//all authors are responsible
		return this.eventService.getById(eventId)
			.pipe(
				map(event => event.author)
			);
	}

	/**
	 * Returns an observable containing the list of responsible users of the requested event
	 * @param {number} eventId
	 * @returns {Observable<User[]>}
	 */
	public getResponsible(eventId: number): Observable<User[]> {
		return this.getResponsibleIds(eventId)
			.pipe(
				mergeMap(authorIds =>
					combineLatest(
						...authorIds.map(id => this.userService.getById(id))
					)
				)
			);
	}
}
