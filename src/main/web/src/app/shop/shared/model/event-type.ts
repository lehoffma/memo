export enum EventType {
	merch = "merch",
	tours = "tours",
	partys = "partys"
}


export function integerToType(eventType: number) {
	switch (eventType) {
		case 3:
			return EventType.merch;
		case 2:
			return EventType.partys;
		case 1:
			return EventType.tours;
	}
	return 0;
}

export function typeToInteger(eventType: EventType) {
	switch (eventType) {
		case EventType.merch:
			return 3;
		case EventType.partys:
			return 2;
		case EventType.tours:
			return 1;
	}
	return 0;
}

export function getEventTypes(): EventType[] {
	return Object.keys(EventType).map(typeKey => EventType[typeKey]);
}
