import {BaseObject} from "./util/base-object";
import {EntryCategory} from "./entry-category";
import {Moment} from "moment";
import * as moment from "moment";;

export class Entry extends BaseObject<Entry> {

	constructor(public readonly id: number,
				public readonly name: string,
				public readonly value: number,
				public readonly date: Moment,
				public readonly comment: string,
				//todo public readonly imagePath:string,
				public readonly category: EntryCategory) {
		super(id);
	}

	static create() {
		return new Entry(-1, "", 0, moment(), "", null);
	}

	static isEntry(entry: any): entry is Entry {
		return (<Entry>entry).name !== undefined && (<Entry>entry).value !== undefined;
	}

	/**
	 * Checks if the given query parameter value (e.g. "tours|food") matches the cost type of this entry
	 * @param {string} queryParameterValue
	 * @returns {boolean}
	 */
	categoryMatchesQueryParameter(queryParameterValue: string) {
		if (queryParameterValue === "none") {
			return false;
		}
		return queryParameterValue.split("|")
			.some(type => type.toLowerCase() === this.category.name.toLowerCase());
	}
}
