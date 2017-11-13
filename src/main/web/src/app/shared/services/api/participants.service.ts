import {Injectable} from "@angular/core";
import {EventType} from "../../../shop/shared/model/event-type";
import {Participant, ParticipantUser} from "../../../shop/shared/model/participant";
import {UserService} from "./user.service";
import {HttpClient, HttpParams} from "@angular/common/http";
import {AddOrModifyRequest, AddOrModifyResponse} from "./servlet.service";
import {Tour} from "../../../shop/shared/model/tour";
import {Party} from "../../../shop/shared/model/party";
import {Merchandise} from "../../../shop/shared/model/merchandise";
import {EventUtilityService} from "../event-utility.service";
import {empty} from "rxjs/observable/empty";
import {of} from "rxjs/observable/of";
import {Observable} from "rxjs/Observable";
import {catchError, map, mergeMap, retry, share} from "rxjs/operators";
import {combineLatest} from "rxjs/observable/combineLatest";

interface ParticipantApiResponse {
	participants: Participant[]
}

@Injectable()
export class ParticipantsService {
	baseUrl = "/api/participants";

	constructor(private http: HttpClient,
				private userService: UserService) {

	}

	//todo von servletService erben lassen
	//todo rewrite

	handleError<T>(error: any) {
		console.error(error);
		return empty<T>();
	}

	/**
	 *
	 * @param eventId
	 * @param eventType
	 * @returns {any}
	 */
	getParticipantIdsByEvent(eventId: number, eventType: EventType): Observable<Participant[]> {
		if (eventType === EventType.merch) {
			return of([]);
		}

		return this.http.get<ParticipantApiResponse>(this.baseUrl, {
			params: new HttpParams().set("eventId", "" + eventId)
				.set("type", "" + eventType)
		})
			.pipe(
				map(response => response.participants),
				//retry 3 times before throwing an error
				retry(3),
				//log any errors
				catchError(error => this.handleError<Participant[]>(error)),
				//convert the observable to a hot observable, i.e. immediately perform the http request
				//instead of waiting for someone to subscribe
				share()
			);
	}

	/**
	 *
	 * @param eventId
	 * @param eventType
	 */
	getParticipantUsersByEvent(eventId: number, eventType: EventType): Observable<ParticipantUser[]> {
		return this.getParticipantIdsByEvent(eventId, eventType)
			.pipe(
				mergeMap(participants => combineLatest(
					...participants.map(participant => this.userService.getById(participant.id)
						.pipe(
							map(user => ({
								id: participant.id,
								user,
								isDriver: participant.isDriver,
								hasPaid: participant.hasPaid,
								comments: participant.comments
							}))
						))))
			)
	}


	/**
	 *
	 * @param userId
	 */
	getParticipatedEventsOfUser(userId: number): Observable<(Tour | Party)[]> {
		return this.http.get<{
			events: (Party | Merchandise | Tour)[];
		}>(this.baseUrl, {
			params: new HttpParams().set("userId", "" + userId)
		})
			.pipe(
				map(json => json.events
					.filter(event => !EventUtilityService.isMerchandise(event))
					.map(event => EventUtilityService.optionalShopItemSwitch(event,
						{
							tours: () => Tour.create().setProperties(event),
							partys: () => Party.create().setProperties(event)
						})
					)),
				share()
			)
	}

	/**
	 *
	 * @param requestMethod
	 * @param eventId
	 * @param eventType
	 * @param participant
	 * @returns {Observable<T>}
	 */
	addOrModify(requestMethod: AddOrModifyRequest,
				eventId: number, eventType: EventType, participant: Participant): Observable<number> {

		return requestMethod<AddOrModifyResponse>(this.baseUrl, {eventId, eventType, participant})
			.pipe(
				map(response => response.id),
				//retry 3 times before throwing an error
				retry(3),
				//log any errors
				catchError(error => this.handleError<number>(error)),
				//convert the observable to a hot observable, i.e. immediately perform the http request
				//instead of waiting for someone to subscribe
				share()
			);
	}

	/**
	 *
	 * @param eventId
	 * @param eventType
	 * @param participant
	 */
	updateParticipant(eventId: number, eventType: EventType, participant: Participant): Observable<number> {
		return this.addOrModify(this.http.put.bind(this.http), eventId, eventType, participant);
	}

	/**
	 *
	 * @param eventId
	 * @param eventType
	 * @param participant
	 * @returns {Observable<any>}
	 */
	addParticipant(eventId: number, eventType: EventType, participant: Participant): Observable<number> {
		return this.addOrModify(this.http.post.bind(this.http), eventId, eventType, participant);
	}

	/**
	 *
	 * @param eventId
	 * @param eventType
	 * @param participantId
	 */
	deleteParticipant(eventId: number, eventType: EventType, participantId: number): Observable<any> {
		return this.http.delete("/api/participants", {
			params: new HttpParams().set("eventId", "" + eventId)
				.set("type", "" + eventType)
				.set("id", "" + participantId)
		})
			.pipe(
				//retry 3 times before throwing an error
				retry(3),
				//log any errors
				catchError(error => this.handleError<any>(error)),
				//convert the observable to a hot observable, i.e. immediately perform the http request
				//instead of waiting for someone to subscribe
				share()
			);
	}
}
