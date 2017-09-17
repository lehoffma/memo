import {User} from "../../shared/model/user";

export interface LeaderboardRow extends User{
	position: number;
}
