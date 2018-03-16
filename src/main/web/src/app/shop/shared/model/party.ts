import {Event} from "./event";
import {ClubRole} from "../../../shared/model/club-role";
import {EventOverviewKey} from "../../shop-item/item-details/container/overview/event-overview-key";
import {EventRoute} from "./route";
import {EventType, typeToInteger} from "./event-type";

export class Party extends Event {

	constructor(id: number,
				title: string,
				date: Date,
				description: string,
				expectedReadRole: ClubRole,
				expectedCheckInRole: ClubRole,
				expectedWriteRole: ClubRole,
				route: EventRoute,
				images: string[],
				capacity: number,
				price: number,
				public emptySeats: number) {
		super(id, title, date, description, [], expectedReadRole, expectedCheckInRole, expectedWriteRole,
			route, images, capacity, price, typeToInteger(EventType.partys));
	}

	get overviewKeys(): EventOverviewKey[] {
		return [
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
			//todo besseres label oder komplett weg?
			// {
			// 	key: "expectedRole",
			// 	label: "Für"
			// },
		];
	}

	get detailsTableKeys(): EventOverviewKey[] {
		return [
			{
				key: "date",
				label: "Datum",
				pipe: "date"
			},
			{
				key: "capacity",
				label: "Maximale Teilnehmeranzahl"
			},
			{
				key: "emptySeats",
				label: "Freie Plätze"
			},
			{
				key: "price",
				label: "Preis",
				pipe: "price"
			}
		]
	}

	static create() {
		return new Party(-1, "", new Date(), "", ClubRole.Gast, ClubRole.Gast, ClubRole.Gast, [],
			["resources/images/Logo.png"], -1, -1, -1);
	}
}
