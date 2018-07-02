import {Event} from "./event";
import {ClubRole} from "../../../shared/model/club-role";
import {StockService} from "../../../shared/services/api/stock.service";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {EventType, typeToInteger} from "./event-type";

export interface Merchandise extends Event {
	material: string;
}

export function createMerch(): Merchandise {
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
		material: "",
		price: 0,
		type: typeToInteger(EventType.merch)
	};
}

export function merchCapacity$(stockService: StockService, id: number): Observable<number> {
	return stockService.getByEventId(id)
		.pipe(
			map(stock => stock.reduce((sum, it) => sum + it.amount, 0))
		);
}
