import {BaseObject} from "../../../shared/model/util/base-object";

export class Comment extends BaseObject<Comment> {
	constructor(public readonly item: number,
				public readonly id: number,
				public readonly timeStamp: Date,
				public readonly author: number,
				public content: string,
				public parent: number,
				public readonly children: number[] = []) {
		super(id);
	}

	static create() {
		return new Comment(-1, null, new Date(), -1, "", -1, []);
	}

	static isComment(value: any): value is Comment {
		return value && (<Comment>value).timeStamp !== undefined;
	}
}
