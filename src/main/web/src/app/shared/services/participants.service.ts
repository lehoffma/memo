import {Injectable} from "@angular/core";
import {EventType} from "../../shop/shared/model/event-type";
import {Observable} from "rxjs/Observable";
import {Participant, ParticipantUser} from "../../shop/shared/model/participant";
import {Http, RequestOptionsArgs} from "@angular/http";
import {UserService} from "./user.service";

@Injectable()
export class ParticipantsService {

	constructor(private http: Http,
				private userService: UserService) {

	}

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
		let params = new URLSearchParams();
		params.set("eventId", eventId.toString());
		params.set("eventType", eventType.toString());

		//todo remove after demo
		if (eventId >= 0) {
			return Observable.of([
				{
					id: 0,
					isDriver: false,
					hasPaid: true,
					comments: ""
				},
				{
					id: 2,
					isDriver: true,
					hasPaid: false,
					comments: "cooler typ"
				},
				{
					id: 3,
					isDriver: false,
					hasPaid: false,
					comments: ""
				},
				{
					id: 4,
					isDriver: false,
					hasPaid: false,
					comments: ""
				},
				{
					id: 5,
					isDriver: false,
					hasPaid: true,
					comments: ""
				}
			])
		}

		this.http.get("/api/participants", {search: params})
			.map(response => response.json().participants as Participant[])
			//retry 3 times before throwing an error
			.retry(3)
			//log any errors
			.catch(this.handleError)
			//convert the observable to a hot observable, i.e. immediately perform the http request
			//instead of waiting for someone to subscribe
			.publish().refCount();
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
	 * @param requestMethod
	 * @param eventId
	 * @param eventType
	 * @param participant
	 * @returns {Observable<T>}
	 */
	addOrModify(requestMethod: (url: string, body: any, options?: RequestOptionsArgs) => Observable<Response>,
				eventId: number, eventType: EventType, participant: Participant): Observable<any> {

		return requestMethod("/api/participants", {eventId, eventType, participant})
			.map(response => response.json() as any)
			//retry 3 times before throwing an error
			.retry(3)
			//log any errors
			.catch(this.handleError)
			//convert the observable to a hot observable, i.e. immediately perform the http request
			//instead of waiting for someone to subscribe
			.publish().refCount();
	}

	/**
	 *
	 * @param eventId
	 * @param eventType
	 * @param participant
	 */
	updateParticipant(eventId: number, eventType: EventType, participant: Participant): Observable<any> {
		return this.addOrModify(this.http.put.bind(this.http), eventId, eventType, participant);
	}

	/**
	 *
	 * @param eventId
	 * @param eventType
	 * @param participant
	 * @returns {Observable<any>}
	 */
	addParticipant(eventId: number, eventType: EventType, participant: Participant): Observable<any> {
		return this.addOrModify(this.http.post.bind(this.http), eventId, eventType, participant);
	}

	/**
	 *
	 * @param eventId
	 * @param eventType
	 * @param participantId
	 */
	deleteParticipant(eventId: number, eventType: EventType, participantId: number): Observable<any> {
		return this.http.delete("/api/participants", {body: {eventId, eventType, participantId}})
			.map(response => response.json() as any)
			//retry 3 times before throwing an error
			.retry(3)
			//log any errors
			.catch(this.handleError)
			//convert the observable to a hot observable, i.e. immediately perform the http request
			//instead of waiting for someone to subscribe
			.publish().refCount();
	}
}
