import {Event} from "./event";
import {Address} from "./address";
import {ClubRole} from "./club-role";
export class Merchandise extends Event {


    constructor(id: number = 9999,
                title: string = "default",
                date: Date = new Date(1999, 9, 19),
                description: string = "default",
                expectedRole: ClubRole = ClubRole.Mitglied,
                picPath: string = "default",
                capacity: number = -1,
                priceMember: number = 9999,
                meetingPoint: Address = new Address()) {
        super(id, title, date, description, expectedRole, picPath, capacity, priceMember, meetingPoint);
    }
}