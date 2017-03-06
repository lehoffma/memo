import {Event} from "./event";
import {ClubRole} from "./club-role";
import {Participant} from "./participant";
export class Party extends Event {

    constructor(id: number = 9999,
                title: string = "default",
                date: Date = new Date(1999, 9, 19),
                description: string = "default",
                expectedRole: ClubRole = ClubRole.Mitglied,
                picPath: string = "default",
                capacity: number = -1,
                priceMember: number = 9999,
                meetingPoint: number = 0,
                private _emptySeats: number = -1,
                private _participants:Participant[] = []) {
        super(id, title, date, description, expectedRole, picPath, capacity, priceMember, meetingPoint);
    }


    get emptySeats(): number {
        return this._emptySeats;
    }

    set emptySeats(value: number) {
        this._emptySeats = value;
    }

    get participants(): Array<Participant> {
        return this._participants;
    }

    set participants(value: Array<Participant>) {
        this._participants = value;
    }
}