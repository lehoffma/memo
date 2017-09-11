import {BaseObject} from "./util/base-object";

export class EntryCategory extends BaseObject<EntryCategory> {
	constructor(public readonly id: number,
				public readonly name: string,) {
		super(id);
	}

	static create() {
		return new EntryCategory(-1, "");
	}

	static isEntryCategory(object:any): object is EntryCategory{
		return object["id"] !== undefined && object["name"] !== undefined;
	}
}
