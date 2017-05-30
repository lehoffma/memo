import {User} from "../../../shared/model/user";
export interface Participant {
	id: number,
	isDriver: boolean,
	hasPaid: boolean,
	comments: string
}

export interface ParticipantUser{
	user: User,
	isDriver: boolean,
	hasPaid: boolean,
	comments: string
}
