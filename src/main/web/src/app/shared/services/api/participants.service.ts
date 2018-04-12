import {Injectable} from "@angular/core";
import {EventType, typeToInteger} from "../../../shop/shared/model/event-type";
import {Participant, ParticipantUser} from "../../../shop/shared/model/participant";
import {UserService} from "./user.service";
import {HttpClient, HttpParams} from "@angular/common/http";
import {ServletService} from "./servlet.service";
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
import {Order} from "../../model/order";
import {PaymentMethod} from "../../../shop/checkout/payment/payment-method";

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

	add(participant: ParticipantUser, eventType: EventType, eventId: number): Observable<Participant> {
		let {user, ...newParticipant} = participant;
		if (newParticipant["item"] && newParticipant["item"]["id"] !== undefined) {
			(<any>newParticipant).item = participant.item.id;
		}
		let order = Order.create().setProperties({
			timeStamp: new Date(),
			items: [newParticipant],
			user: user.id,
			method: PaymentMethod.CASH,
			text: ""
		});
		//todo add name/phone number to text or order

		return this.orderService.add(order)
			.pipe(map(order => order.items[0]));
	}

	modify(participant: ParticipantUser, eventType: EventType, eventId: number): Observable<Participant> {
		let {user, ...modifiedParticipant} = participant;

		if (modifiedParticipant["item"] && modifiedParticipant["item"]["id"] !== undefined) {
			(<any>modifiedParticipant).item = participant.item.id;
		}

		//todo add name/phone number to text or order
		return this.orderService.getByOrderedItemId(modifiedParticipant.id)
			.pipe(
				mergeMap((order: Order) => {
					order.setProperties({
						items: [...order.items].map(it => {
							return {
								...it,
								item: it.item.id
							}
						})
					});
					const itemIndex = order.items.findIndex(it => it.id === modifiedParticipant.id);
					order.items.splice(itemIndex, 1, modifiedParticipant);

					return this.orderService.modify(order);
				}),
				map(order => order.items[0])
			);
	}

	remove(participantId: number, eventType: EventType, eventId: number): Observable<Object> {
		return this.performRequest(
			this.http.delete("/api/participants", {
				params: new HttpParams().set("eventId", "" + eventId)
					.set("type", "" + typeToInteger(eventType))
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
	getParticipantIdsByEvent(eventId: number, eventType?: EventType): Observable<Participant[]> {
		if (eventType === EventType.merch) {
			return of([]);
		}

		const params = new HttpParams().set("eventId", "" + eventId)
			.set("type", "" + typeToInteger(eventType));

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
	getParticipantUsersByEvent(eventId: number, eventType?: EventType): Observable<ParticipantUser[]> {
		return this.getParticipantIdsByEvent(eventId, eventType)
			.pipe(
				mergeMap(participants => {
					if (!participants || participants.length === 0) {
						return of([]);
					}

					return combineLatest(
						...participants.map(participant => this.userService.getByParticipantId(participant.id)
							.pipe(
								map(user => ({
									...participant,
									user,
								}))
							)))
				})
			)
	}


	/**
	 *
	 * @param userId
	 */
	getParticipatedEventsOfUser(userId: number): Observable<(Tour | Party)[]> {
		const params = new HttpParams().set("userId", "" + userId);
		const request = this.performRequest(
			this.http.get<{ shopItems: (Party | Merchandise | Tour)[] }>("/api/participatedEvents", {params})
		).pipe(
			map(json => json.shopItems
				.filter(event => !EventUtilityService.isMerchandise(event))
				.map(event => EventUtilityService.handleShopItemOptional(event,
					{
						tours: it => Tour.create().setProperties({...it}),
						partys: it => Party.create().setProperties({...it})
					})
				)),
			share()
		);

		return this._cache.other<(Tour | Party)[]>(params, request);
	}


	invalidateCache() {
		this._cache.invalidateAll();
	}
}
