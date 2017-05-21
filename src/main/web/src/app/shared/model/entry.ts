import {ImmutableObject} from "./util/immutable-object";
import {EntryCategory} from "./entry-category";
export class Entry extends ImmutableObject<Entry> {

	constructor(public id: number,
				public name: string,
				public value: number,
				public category: EntryCategory) {
		super(id);
	}

	static create() {
		return new Entry(-1, "", 0, null);
	}

	static isEntry(entry: any): entry is Entry {
		return (<Entry>entry).name !== undefined && (<Entry>entry).value !== undefined;
	}
}
