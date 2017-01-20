import {Event} from "./event";
import {Address} from "./address";
import {ClubRole} from "./club-role";
import {SizeTable} from "./sizeTable";
export class Merchandise extends Event {
    get color(): string[] {
        return this._color;
    }

    set color(value: string[]) {
        this._color = value;
    }
    constructor(id: number = 9999,
                title: string = "default",
                date: Date = new Date(1999, 9, 19),
                description: string = "default",
                expectedRole: ClubRole = ClubRole.Mitglied,
                picPath: string = "default",
                capacity: number = -1,
                private _color: string[] = [],
                private _material: string = "default",
                private _sizeTable: SizeTable = {},
                priceMember: number = 9999,
                meetingPoint: Address = new Address()) {
        super(id, title, date, description, expectedRole, picPath, capacity, priceMember, meetingPoint);
    }

    get sizeTable(): SizeTable {
        return this._sizeTable;
    }

    set sizeTable(value: SizeTable) {
        this._sizeTable = value;
    }


    get material(): string {
        return this._material;
    }

    set material(value: string) {
        this._material = value;
    }



}