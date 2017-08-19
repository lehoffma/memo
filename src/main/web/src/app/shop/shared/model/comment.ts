import {BaseObject} from "../../../shared/model/util/base-object";

export class Comment extends BaseObject<Comment> {
	constructor(public readonly eventId: number,
				public readonly id: number,
				public readonly timeStamp: Date,
				public readonly authorId: number,
				public text: string,
				public readonly children: number[] = []) {
		super(id);
	}

	static create() {
		return new Comment(-1, -1, new Date(), -1, "", []);
	}

	static isComment(value: any): value is Comment {
		return (<Comment>value).timeStamp !== undefined;
	}
}
