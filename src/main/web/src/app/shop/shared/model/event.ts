import {ClubRole} from "../../../shared/model/club-role";
import {ImmutableObject} from "../../../shared/model/immutable-object";
import {EventOverviewKey} from "../../item-details/container/overview/event-overview-key";


export class Event extends ImmutableObject<Event> {
	constructor(public id: number,
				public title: string,
				public date: Date,
				public description: string,
				public expectedRole: ClubRole,
				public imagePath: string,
				public capacity: number,
				public priceMember: number,
				public meetingPoint: number,
				public price: number = priceMember) {
		super(id);
	}

	static create() {
		return new Event(-1, "", new Date(1999, 9, 19), "", ClubRole.None, "", -1, -1, -1, -1);
	}

	/**
	 * Geht alle Attribute des Objektes durch und gibt true zurück, wenn der Wert mindestens eines Attributes auf den
	 * Suchbegriff matcht. Der Default-Wert des Suchbegriffs ist dabei "", für welchen immer true
	 * zurückgegeben wird (der leere String ist Teilstring von jedem String).
	 * @param searchTerm
	 * @returns {string[]}
	 */
	matchesSearchTerm(searchTerm: string = ""): boolean {
		return Object.keys(this).some(key => ("" + this[key]).includes(searchTerm));
	}

	get overviewKeys(): EventOverviewKey[] {
		return [];
	}

	get detailsTableKeys(): EventOverviewKey[] {
		return [];
	}
}
