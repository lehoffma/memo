import {Party} from "./party";
import {ClubRole} from "../../../shared/model/club-role";
import {EventType, typeToInteger} from "./event-type";

export interface Tour extends Party {
	vehicle: string;
	miles: number;
}

export function createTour(): Tour {
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
		type: typeToInteger(EventType.tours),
		vehicle: "",
		miles: -1
	}
}
