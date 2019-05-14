import {Tour} from "../../../shop/shared/model/tour";
import {Party} from "../../../shop/shared/model/party";

export interface GroupedEventList {
	"Heute": (Party | Tour)[];
	"Morgen": (Party | Tour)[];
	"Diese Woche": (Party | Tour)[];
	"Dieser Monat": (Party | Tour)[];

	[month: string]: (Party | Tour)[];
}
