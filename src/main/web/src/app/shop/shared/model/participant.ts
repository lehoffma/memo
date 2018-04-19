import {User} from "../../../shared/model/user";
import {OrderedItem} from "../../../shared/model/ordered-item";

export type Participant = OrderedItem;

export interface ParticipantUser extends Participant {
	user: User
}
