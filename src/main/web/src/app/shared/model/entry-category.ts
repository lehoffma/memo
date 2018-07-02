import {BaseObject} from "./util/base-object";

export interface EntryCategory extends BaseObject {
	readonly name: string;
	readonly category: number;
}

export function createEntryCategory() {
	return {
		id: -1,
		name: "",
		category: -1
	}
}
