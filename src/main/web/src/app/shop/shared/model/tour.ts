import {Event} from "./event";
import {ClubRole} from "../../../shared/model/club-role";
import {EventOverviewKey} from "../../shop-item/item-details/container/overview/event-overview-key";
import {EventRoute} from "./route";
import * as moment from "moment";
import {Moment} from "moment";
import {EventType, typeToInteger} from "./event-type";

;

export class Tour extends Event {

	constructor(id: number,
				title: string,
				date: Moment,
				description: string,
				expectedReadRole: ClubRole,
				expectedCheckInRole: ClubRole,
				expectedWriteRole: ClubRole,
				route: EventRoute,
				images: string[],
				capacity: number,
				price: number,
				public vehicle: string,
				public miles: number,
				public emptySeats: number) {

		super(id, title, date, description, expectedReadRole, expectedCheckInRole, expectedWriteRole,
			route, images, capacity, price, typeToInteger(EventType.tours));
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
			{
				key: "miles",
				label: "Meilen"
			}
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
				key: "miles",
				label: "Meilen"
			},
			{
				key: "price",
				label: "Preis",
				pipe: "price"
			},
			{
				key: "vehicle",
				label: "Fahrzeug"
			},

		]
	}

	static create() {
		return new Tour(-1, "", moment(), "", ClubRole.None, ClubRole.None, ClubRole.None, [],
			["resources/images/Logo.png"], -1, -1, "", -1, -1);
	}
}
