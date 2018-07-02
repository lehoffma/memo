import {BaseObject} from "../../../shared/model/util/base-object";

export interface Comment extends BaseObject {
	readonly item: number;
	readonly timeStamp: Date;
	readonly author: number;
	content: string;
	parent: number;
	readonly children: number[];
}

export function createComment(): Comment {
	return {
		id: -1,
		item: -1,
		author: -1,
		timeStamp: new Date(),
		content: "",
		parent: -1,
		children: []
	}
}
