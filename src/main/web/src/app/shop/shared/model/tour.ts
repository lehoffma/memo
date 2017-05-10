import {Event} from "./event";
import {ClubRole} from "../../../shared/model/club-role";
import {Participant} from "./participant";
import {EventOverviewKey} from "../../item-details/container/overview/event-overview-key";
export class Tour extends Event {

	constructor(id: number,
				title: string,
				date: Date,
				description: string,
				expectedRole: ClubRole,
				imagePath: string,
				capacity: number,
				priceMember: number,
				meetingPoint: number,
				public vehicle: string,
				public miles: number,
				public destination: string,
				public emptySeats: number,
				public participants: Participant[]) {

		super(id, title, date, description, expectedRole, imagePath, capacity, priceMember, meetingPoint);
	}

	static create() {
		return new Tour(-1, "", new Date(1999, 9, 19), "", ClubRole.None, "", -1, -1, -1, "", -1, "", -1, []);
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
}
