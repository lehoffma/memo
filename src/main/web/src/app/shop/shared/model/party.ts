import {Event} from "./event";
import {ClubRole} from "../../../shared/model/club-role";
import {EventType, typeToInteger} from "./event-type";

export interface Party extends Event {
	emptySeats: number;
}

export function createParty(): Party {
	return {
		id: -1,
		title: "",
		date: new Date(),
		description: "",
		expectedReadRole: ClubRole.Gast,
		expectedCheckInRole: ClubRole.Gast,
		expectedWriteRole: ClubRole.Gast,
		author: [],
		route: [],
		images: ["resources/images/Logo.png"],
		capacity: -1,
		groupPicture: "",
		price: 0,
		emptySeats: -1,
		type: typeToInteger(EventType.partys)
	}
}
