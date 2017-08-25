import {ClubRole} from "../../../shared/model/club-role";
import {BaseObject} from "../../../shared/model/util/base-object";
import {EventOverviewKey} from "../../shop-item/item-details/container/overview/event-overview-key";
import {EventRoute} from "./route";


export class Event extends BaseObject<Event> {
	constructor(public id: number,
				public title: string,
				public date: Date,
				public description: string,
				public expectedRole: ClubRole,
				public route: EventRoute,
				public imagePath: string,
				public capacity: number,
				public priceMember: number,
				public price: number = priceMember) {
		super(id);
	}

	get overviewKeys(): EventOverviewKey[] {
		return [];
	}

	get detailsTableKeys(): EventOverviewKey[] {
		return [];
	}

	static create() {
		return new Event(-1, "", new Date(1999, 9, 19), "", ClubRole.None, [], "resources/images/Logo.png", -1, -1, -1);
	}
}
