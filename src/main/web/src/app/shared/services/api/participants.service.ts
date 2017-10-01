import {Injectable} from "@angular/core";
import {EventType} from "../../../shop/shared/model/event-type";
import {Observable} from "rxjs/Observable";
import {Participant, ParticipantUser} from "../../../shop/shared/model/participant";
import {UserService} from "./user.service";
import {HttpClient, HttpParams} from "@angular/common/http";
import {AddOrModifyRequest, AddOrModifyResponse} from "./servlet.service";
import {Tour} from "../../../shop/shared/model/tour";
import {Party} from "../../../shop/shared/model/party";
import {Merchandise} from "../../../shop/shared/model/merchandise";
import {CacheStore} from "../../stores/cache.store";
import {EventUtilityService} from "../event-utility.service";

interface ParticipantApiResponse {
	participants: Participant[]
}

@Injectable()
export class ParticipantsService {
	baseUrl = "/api/participants";

	constructor(private http: HttpClient,
				private userService: UserService,
				private cache: CacheStore) {

	}

	//todo von servletService erben lassen

	handleError(error: any) {
		console.error(error);
		return Observable.empty();
	}

	/**
	 *
	 * @param eventId
	 * @param eventType
	 * @returns {any}
	 */
	getParticipantIdsByEvent(eventId: number, eventType: EventType): Observable<Participant[]> {
		if (eventType === EventType.merch) {
			return Observable.of([]);
		}

		return this.http.get<ParticipantApiResponse>(this.baseUrl, {
			params: new HttpParams().set("eventId", "" + eventId)
				.set("type", "" + eventType)
		})
			.map(response => response.participants)
			//retry 3 times before throwing an error
			.retry(3)
			//log any errors
			.catch(this.handleError)
			//convert the observable to a hot observable, i.e. immediately perform the http request
			//instead of waiting for someone to subscribe
			.share();
	}

	/**
	 *
	 * @param eventId
	 * @param eventType
	 */
	getParticipantUsersByEvent(eventId: number, eventType: EventType): Observable<ParticipantUser[]> {
		return this.getParticipantIdsByEvent(eventId, eventType)
			.flatMap(participants => {
				return Observable.combineLatest(...participants.map(participant => this.userService.getById(participant.id)
					.map(user => ({
						id: participant.id,
						user,
						isDriver: participant.isDriver,
						hasPaid: participant.hasPaid,
						comments: participant.comments
					}))));
			})
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
			.map(json => json.events
				.filter(event => !EventUtilityService.isMerchandise(event))
				.map(event => EventUtilityService.optionalShopItemSwitch(event,
					{
						tours: () => Tour.create().setProperties(event),
						partys: () => Party.create().setProperties(event)
					})
				))
			.do(events => this.cache.addMultiple(...events))
			.share()
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
			.map(response => response.id)
			//retry 3 times before throwing an error
			.retry(3)
			//log any errors
			.catch(this.handleError)
			//convert the observable to a hot observable, i.e. immediately perform the http request
			//instead of waiting for someone to subscribe
			.share();
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
		//retry 3 times before throwing an error
			.retry(3)
			//log any errors
			.catch(this.handleError)
			//convert the observable to a hot observable, i.e. immediately perform the http request
			//instead of waiting for someone to subscribe
			.share();
	}
}
