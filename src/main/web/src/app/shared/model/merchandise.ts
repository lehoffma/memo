import {Event} from "./event";
import {ClubRole} from "./club-role";
import {SizeTable} from "./size-table";
export class Merchandise extends Event {

    constructor(id: number = 9999,
                title: string = "default",
                date: Date = new Date(1999, 9, 19),
                description: string = "default",
                expectedRole: ClubRole = ClubRole.Mitglied,
                picPath: string = "default",
                capacity: number = -1,
                private _colors: string[] = [],
                private _material: string = "default",
                private _sizeTable: SizeTable = {},
                priceMember: number = 9999,
                meetingPoint: number = 0) {
        super(id, title, date, description, expectedRole, picPath, capacity, priceMember, meetingPoint);
    }

    get colors(): string[] {
        return this._colors;
    }

    set colors(value: string[]) {
        this._colors = value;
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