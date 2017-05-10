import {ImmutableObject} from "./util/immutable-object";
export class Entry extends ImmutableObject<Entry> {

	constructor(public id: number) {
		super(id);
	}

	static create() {
		return new Entry(-1);
	}

	static isEntry(entry: any): entry is Entry {
		//TODO implement
		return true;
	}
}
