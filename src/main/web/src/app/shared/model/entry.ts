import {ImmutableObject} from "./util/immutable-object";
import {EntryCategory} from "./entry-category";
export class Entry extends ImmutableObject<Entry> {

	constructor(public readonly id: number,
				public readonly name: string,
				public readonly value: number,
				//todo entry date
				public readonly category: EntryCategory) {
		super(id);
	}

	static create() {
		return new Entry(-1, "", 0, null);
	}

	static isEntry(entry: any): entry is Entry {
		return (<Entry>entry).name !== undefined && (<Entry>entry).value !== undefined;
	}

	/**
	 * Checks if the given query parameter value (e.g. "tours|food") matches the cost type of this entry
	 * @param {string} queryParameterValue
	 * @returns {boolean}
	 */
	categoryMatchesQueryParameter(queryParameterValue: string){
		return queryParameterValue.split("|")
			.some(type => type.toLowerCase() === EntryCategory[this.category].toLowerCase());
	}
}
