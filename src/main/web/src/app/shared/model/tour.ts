import {Event} from "./event";
import {Address} from "./address";
import {ClubRole} from "./club-role";
export class Tour extends Event {

    constructor(id: number = 9999,
                title: string = "default",
                date: Date = new Date(1999, 9, 19),
                description: string = "default",
                expectedRole: ClubRole = ClubRole.Mitglied,
                picPath: string = "default",
                capacity: number = -1,
                priceMember: number = 9999,
                meetingPoint: Address = new Address(),
                private _vehicle: string = "default",
                private _miles: number = 0,
                private _destination: string = "default",
                private _emptySeats: number = -1,
                private _participants: number[] = []) {

        super(id, title, date, description, expectedRole, picPath, capacity, priceMember, meetingPoint);

    }

    get vehicle(): string {
        return this._vehicle;
    }

    set vehicle(value: string) {
        this._vehicle = value;
    }

    get miles(): number {
        return this._miles;
    }

    set miles(value: number) {
        this._miles = value;
    }

    get destination(): string {
        return this._destination;
    }

    set destination(value: string) {
        this._destination = value;
    }

    get emptySeats(): number {
        return this._emptySeats;
    }

    set emptySeats(value: number) {
        this._emptySeats = value;
    }

    get participants(): Array<number> {
        return this._participants;
    }

    set participants(value: Array<number>) {
        this._participants = value;
    }
}