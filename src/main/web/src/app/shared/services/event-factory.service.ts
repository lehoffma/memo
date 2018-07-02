import {Injectable} from "@angular/core";
import {EventType} from "../../shop/shared/model/event-type";
import {Event} from "../../shop/shared/model/event";
import {createMerch} from "../../shop/shared/model/merchandise";
import {createParty} from "../../shop/shared/model/party";
import {createTour} from "../../shop/shared/model/tour";

@Injectable()
export class EventFactoryService {

	constructor() {
	}

	static build(eventType: EventType): Event {
		switch (eventType) {
			case EventType.merch:
				return createMerch();
			case EventType.tours:
				return createTour();
			case EventType.partys:
				return createParty();

		}
		return null;
	}
}
