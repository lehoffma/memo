import {BaseObject} from "../../../shared/model/util/base-object";
import * as moment from "moment";
import {Moment} from "moment";

export class Comment extends BaseObject<Comment> {
	constructor(public readonly eventId: number,
				public readonly id: number,
				public readonly timeStamp: Moment,
				public readonly authorId: number,
				public text: string,
				public readonly children: number[] = []) {
		super(id);
	}

	static create() {
		return new Comment(-1, -1, moment(), -1, "", []);
	}

	static isComment(value: any): value is Comment {
		return value && (<Comment>value).timeStamp !== undefined;
	}
}
