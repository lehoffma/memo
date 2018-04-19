import {BaseObject} from "./util/base-object";

export class EntryCategory extends BaseObject<EntryCategory> {
	constructor(public readonly id: number,
				public readonly name: string,
				public readonly category: number
	) {
		super(id);
	}

	static create() {
		return new EntryCategory(-1, "", 1);
	}

	static isEntryCategory(object: any): object is EntryCategory {
		return object && object["id"] !== undefined && object["name"] !== undefined;
	}
}
