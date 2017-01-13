import {ClubRole} from "./club-role";
import {Address} from "./address";
import {User} from "./user";
import {Permission} from "./permission";
export class Event {
    constructor(protected _id: number = 9999,
                protected _title: string = "default",
                protected _date: Date = new Date(1999, 9, 19),
                protected _description: string = "default",
                protected _expectedRole: ClubRole = ClubRole.Mitglied,
                protected _picPath: string = "default",
                protected _capacity: number = -1,
                protected _priceMember: number = 9999,
                protected _meetingPoint: Address = new Address(),
                protected _price: number = _priceMember) {

    }

    /**
     * converts a json object (which only contains string values) into an actual event object
     * @param json the json (provided externally, for example by the server)
     * @returns {Event} the composed event object
     */
    fromJSON(json: any): Event {
        let role: ClubRole = ClubRole.None;

        switch (json["expectedRole"]) {
            case "Admin":
                role = ClubRole.Admin;
                break;
            case "Kasse":
                role = ClubRole.Kasse;
                break;
            case "Mitglied":
                role = ClubRole.Mitglied;
                break;
            case "Vorstand":
                role = ClubRole.Vorstand;
                break;
            case "Organizer":
                role = ClubRole.Organizer;
        }

        return new Event(
            +json["id"],
            json["title"],
            new Date(json["date"]),
            json["description"],
            role,
            json["picPath"],
            +json["capacity"],
            +json["priceMember"],
            //todo address as json
            json["meetingPoint"]
        )
    }


    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    get title(): string {
        return this._title;
    }

    set title(value: string) {
        this._title = value;
    }

    get date(): Date {
        return this._date;
    }

    set date(value: Date) {
        this._date = value;
    }

    get description(): string {
        return this._description;
    }

    set description(value: string) {
        this._description = value;
    }

    get expectedRole(): ClubRole {
        return this._expectedRole;
    }

    set expectedRole(value: ClubRole) {
        this._expectedRole = value;
    }

    get picPath(): string {
        return this._picPath;
    }

    set picPath(value: string) {
        this._picPath = value;
    }

    get capacity(): number {
        return this._capacity;
    }

    set capacity(value: number) {
        this._capacity = value;
    }

    get priceMember(): number {
        return this._priceMember;
    }

    set priceMember(value: number) {
        this._priceMember = value;
    }

    get meetingPoint(): Address {
        return this._meetingPoint;
    }

    set meetingPoint(value: Address) {
        this._meetingPoint = value;
    }

    get price(): number {
        return this._price;
    }

    set price(value: number) {
        this._price = value;
    }
}
