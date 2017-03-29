import {Injectable} from "@angular/core";
import {Merchandise} from "../model/merchandise";
import {Event} from "../model/event";
import {Tour} from "../model/tour";
import {Party} from "../model/party";
import {isNullOrUndefined} from "util";
import {EventOverviewKey} from "../../object-details/container/object-details-overview/object-details-overview.component";
import {EventType} from "../model/event-type";


export const overViewKeys = {
	"merch": [
		{
			key: "price",
			label: "Preis",
			pipe: "price"
		},
		{
			key: "material",
			label: "Material",
		},
		{
			key: "capacity",
			label: "Auf Lager",
		},
		{
			key: "expectedRole",
			label: "Für"
		},
	],
	"tours": [
		{
			key: "price",
			label: "Preis",
			pipe: "price"
		},
		{
			key: "date",
			label: "Datum",
			pipe: "date"
		},
		{
			key: "emptySeats",
			label: "Freie Plätze"
		},
		{
			key: "miles",
			label: "Meilen"
		}
	],
	"partys": [
		{
			key: "price",
			label: "Preis",
			pipe: "price"
		},
		{
			key: "date",
			label: "Datum",
			pipe: "date"
		},
		{
			key: "emptySeats",
			label: "Freie Plätze"
		},
		{
			key: "expectedRole",
			label: "Für"
		},
	]
};


@Injectable()
export class EventService {

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

	getOverviewKeys(event: Event): EventOverviewKey[] {
		return this.handleEvent(event,
			merch => overViewKeys.merch,
			tour => overViewKeys.tours,
			party => overViewKeys.partys,
			_ => []
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
