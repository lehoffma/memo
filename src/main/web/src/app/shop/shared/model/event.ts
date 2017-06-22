import {ClubRole} from "../../../shared/model/club-role";
import {ImmutableObject} from "../../../shared/model/util/immutable-object";
import {EventOverviewKey} from "../../shop-item/item-details/container/overview/event-overview-key";
import {EventRoute} from "./route";


export class Event extends ImmutableObject<Event> {
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

	static create() {
		return new Event(-1, "", new Date(1999, 9, 19), "", ClubRole.None, [], "", -1, -1, -1);
	}


	get overviewKeys(): EventOverviewKey[] {
		return [];
	}

	get detailsTableKeys(): EventOverviewKey[] {
		return [];
	}
}
