import {Injectable} from "@angular/core";
import {EventType} from "../../shop/shared/model/event-type";
import {Event} from "../../shop/shared/model/event";
import {Merchandise} from "../../shop/shared/model/merchandise";
import {Party} from "../../shop/shared/model/party";
import {Tour} from "../../shop/shared/model/tour";

@Injectable()
export class EventFactoryService {

	constructor() {
	}

	build(eventType: EventType): Event {
		switch (eventType) {
			case EventType.merch:
				return Merchandise.create();
			case EventType.tours:
				return Tour.create();
			case EventType.partys:
				return Party.create();

		}
		return Event.create();
	}
}
