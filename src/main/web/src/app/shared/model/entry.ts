import {ImmutableObject} from "./immutable-object";
export class Entry extends ImmutableObject<Entry> {

	constructor(public id: number) {
		super(id);
	}

	static create() {
		return new Entry(-1);
	}
}
