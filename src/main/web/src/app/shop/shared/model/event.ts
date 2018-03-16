import {ClubRole} from "../../../shared/model/club-role";
import {BaseObject} from "../../../shared/model/util/base-object";
import {EventOverviewKey} from "../../shop-item/item-details/container/overview/event-overview-key";
import {EventRoute} from "./route";

export class Event extends BaseObject<Event> {
	constructor(public id: number,
				public title: string,
				public date: Date,
				public description: string,
				public author: number[],
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
		return new Event(-1, "", new Date(), "", [], ClubRole.Gast, ClubRole.Gast, ClubRole.Gast,
			[], ["resources/images/Logo.png"], -1, -1, -1);
	}

	static isEvent(value: any): value is Event {
		const _value = (<Event>value);
		return _value && _value.expectedWriteRole !== undefined && _value.expectedCheckInRole !== undefined &&
			_value.expectedWriteRole !== undefined;
	}
}
