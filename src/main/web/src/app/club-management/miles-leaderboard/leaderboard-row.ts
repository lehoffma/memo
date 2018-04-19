import {User} from "../../shared/model/user";

export interface LeaderboardRow extends UserInterface {
	position: number;
	miles: number;
}

type UserInterface = {
	[key in keyof User]: User[key];
}
