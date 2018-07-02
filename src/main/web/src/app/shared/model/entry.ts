import {BaseObject} from "./util/base-object";
import {EntryCategory} from "./entry-category";
import {Event} from "../../shop/shared/model/event";

export interface Entry extends BaseObject {
	readonly name: string;
	readonly value: number;
	readonly item: Event;
	readonly date: Date;
	readonly comment: string;
	readonly images: string[];
	readonly category: EntryCategory;
}


export function createEntry(): Entry {
	return {id: -1, name: "", value: 0, item: null, date: new Date(), comment: "", images: [], category: null}
}
