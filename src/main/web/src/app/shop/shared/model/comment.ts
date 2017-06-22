import {ImmutableObject} from "../../../shared/model/util/immutable-object";
export class Comment extends ImmutableObject<Comment> {
	constructor(public readonly eventId: number,
				public readonly id: number,
				public readonly timeStamp: Date,
				public readonly authorId: number,
				public readonly text: string,
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
