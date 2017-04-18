import {Injectable} from "@angular/core";
import {Merchandise} from "../../shop/shared/model/merchandise";
import {Event} from "../../shop/shared/model/event";
import {Tour} from "../../shop/shared/model/tour";
import {Party} from "../../shop/shared/model/party";
import {isNullOrUndefined} from "util";
import {EventType} from "../../shop/shared/model/event-type";


@Injectable()
export class EventUtilityService {

	constructor() {
	}

	getEventType(event: Event): EventType {
		return this.handleEvent(event,
			merch => EventType.merch,
			tour => EventType.tours,
			party => EventType.partys,
			error => {
				console.error(`Could not deduce type from event ${error}`);
				return null;
			}
		)
	}

	/**
	 *
	 * @param event
	 * @param merchCallback
	 * @param tourCallback
	 * @param partyCallback
	 * @param defaultCallback
	 * @returns {T}
	 */
	handleEvent<T>(event: Event,
				   merchCallback: (merch: Merchandise) => T,
				   tourCallback: (tour: Tour) => T,
				   partyCallback: (party: Party) => T,
				   defaultCallback: (event: Event) => T = () => null): T {
		if (isNullOrUndefined(event)) {
			return defaultCallback(event);
		}
		if (this.isMerchandise(event)) {
			return merchCallback(event);
		}
		if (this.isTour(event)) {
			return tourCallback(event);
		}
		if (this.isParty(event)) {
			return partyCallback(event);
		}
		return defaultCallback(event);
	}

	isMerchandise(event: Event): event is Merchandise {
		return event && (<Merchandise>event).colors !== undefined;
	}

	isTour(event: Event): event is Tour {
		return event && (<Tour>event).vehicle !== undefined
	}

	isParty(event: Event): event is Party {
		return event && (<Party>event).emptySeats !== undefined && (<Tour>event).vehicle === undefined;
	}
}
