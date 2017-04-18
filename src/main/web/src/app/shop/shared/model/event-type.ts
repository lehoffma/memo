export enum EventType{
	merch = <any> "merch",
	tours = <any> "tours",
	partys = <any> "partys"
}

export function getEventTypes(): EventType[] {
	return Object.keys(EventType).map(typeKey => EventType[typeKey]);
}
