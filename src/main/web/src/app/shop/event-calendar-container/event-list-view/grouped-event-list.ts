import {Tour} from "../../shared/model/tour";
import {Party} from "../../shared/model/party";

export interface GroupedEventList {
	"Heute": (Party | Tour)[];
	"Morgen": (Party | Tour)[];
	"Diese Woche": (Party | Tour)[];
	"Dieser Monat": (Party | Tour)[];

	[month: string]: (Party | Tour)[];
}
