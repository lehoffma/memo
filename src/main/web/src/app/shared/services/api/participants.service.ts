import {Injectable} from "@angular/core";
import {EventType} from "../../../shop/shared/model/event-type";
import {Participant, ParticipantUser} from "../../../shop/shared/model/participant";
import {UserService} from "./user.service";
import {HttpClient, HttpParams} from "@angular/common/http";
import {AddOrModifyRequest, AddOrModifyResponse, ServletService} from "./servlet.service";
import {Tour} from "../../../shop/shared/model/tour";
import {Party} from "../../../shop/shared/model/party";
import {Merchandise} from "../../../shop/shared/model/merchandise";
import {EventUtilityService} from "../event-utility.service";
import {of} from "rxjs/observable/of";
import {Observable} from "rxjs/Observable";
import {map, mergeMap, share} from "rxjs/operators";
import {combineLatest} from "rxjs/observable/combineLatest";
import {empty} from "rxjs/observable/empty";
import {OrderService} from "./order.service";

interface ParticipantApiResponse {
	participants: Participant[]
}

@Injectable()
export class ParticipantsService extends ServletService<Participant> {
	baseUrl = "/api/participants";

	constructor(private http: HttpClient,
				private orderService: OrderService,
				private userService: UserService) {
		super();

	}


	getById(id: number, ...args: any[]): Observable<Participant> {
		return undefined;
	}

	search(searchTerm: string, ...args: any[]): Observable<Participant[]> {
		return empty();
	}

	add(participant: Participant, eventType: EventType, eventId: number): Observable<Participant> {
		//todo use order service, but how?
		return this.addOrModify(this.http.post.bind(this.http), eventId, eventType, participant);
	}

	modify(participant: Participant, eventType: EventType, eventId: number): Observable<Participant> {
		return this.addOrModify(this.http.put.bind(this.http), eventId, eventType, participant);
	}

	remove(participantId: number, eventType: EventType, eventId: number): Observable<Object> {
		return this.performRequest(
			this.http.delete("/api/participants", {
				params: new HttpParams().set("eventId", "" + eventId)
					.set("type", "" + eventType)
					.set("id", "" + participantId)
			})
		)
			.pipe(
				//convert the observable to a hot observable, i.e. immediately perform the http request
				//instead of waiting for someone to subscribe
				share()
			);
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

		const params = new HttpParams().set("eventId", "" + eventId)
			.set("type", "" + eventType);

		const request = this.performRequest(
			this.http.get<ParticipantApiResponse>(this.baseUrl, {params})
		).pipe(
			map(response => response.participants),
			//convert the observable to a hot observable, i.e. immediately perform the http request
			//instead of waiting for someone to subscribe
			share()
		);

		return this._cache.search(params, request);
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
								...participant,
								user,
							}))
						))))
			)
	}


	/**
	 *
	 * @param userId
	 */
	getParticipatedEventsOfUser(userId: number): Observable<(Tour | Party)[]> {
		const params = new HttpParams().set("userId", "" + userId);
		const request = this.performRequest(
			this.http.get<{ events: (Party | Merchandise | Tour)[] }>(this.baseUrl, {params})
		).pipe(
			map(json => json.events
				.filter(event => !EventUtilityService.isMerchandise(event))
				.map(event => EventUtilityService.optionalShopItemSwitch(event,
					{
						tours: () => Tour.create().setProperties(event),
						partys: () => Party.create().setProperties(event)
					})
				)),
			share()
		);

		return this._cache.other<(Tour | Party)[]>(params, request);
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
				eventId: number, eventType: EventType, participant: Participant): Observable<Participant> {
		return this.performRequest(requestMethod<AddOrModifyResponse>(this.baseUrl, {eventId, eventType, participant}))
			.pipe(
				map(response => response.id),
				mergeMap(response => this.getById(response)),
				//convert the observable to a hot observable, i.e. immediately perform the http request
				//instead of waiting for someone to subscribe
				share()
			);
	}
}
