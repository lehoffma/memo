import {ClubRole} from "../../../shared/model/club-role";
import {BaseObject} from "../../../shared/model/util/base-object";
import {EventOverviewKey} from "../../shop-item/item-details/container/overview/event-overview-key";
import {EventRoute} from "./route";
import * as moment from "moment";
import {Moment} from "moment";


export class Event extends BaseObject<Event> {
	constructor(public id: number,
				public title: string,
				public date: Moment,
				public description: string,
				public expectedReadRole: ClubRole,
				public expectedCheckInRole: ClubRole,
				public expectedWriteRole: ClubRole,
				public route: EventRoute,
				public images: string[],
				public capacity: number,
				public price: number,
				public type: number) {
		super(id);
	}

	get overviewKeys(): EventOverviewKey[] {
		return [];
	}

	get detailsTableKeys(): EventOverviewKey[] {
		return [];
	}

	static create() {
		return new Event(-1, "", moment(), "", ClubRole.None, ClubRole.None, ClubRole.None,
			[], ["resources/images/Logo.png"], -1, -1, -1);
	}
}
