import {Event} from "./event";
import {ClubRole} from "./club-role";
import {SizeTable} from "./size-table";
import {SelectionModel} from "../../object-details/selection/object-details-selection.component";

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

	get clothesSizes(): string[] {
		return Object.keys(this._sizeTable);
	}

	get colorSelections(): SelectionModel[] {
		return this._colors.map(color => ({
			value: color,
			color: color
		}))
	}

	get clothesSizeSelections(): SelectionModel[] {
		return this.clothesSizes.map(size => ({
			value: size,
			color: "white",
			text: size
		}));
	}

	get sizeTableCategories(): string[] {
		return Object.keys(this._sizeTable).reduce((previousValue, currentValue) =>
				previousValue.concat(...Object.keys(this._sizeTable[currentValue])
					.filter(category => previousValue.indexOf(category) === -1)),
			[])
	}

	test() {
		// this.sizeTableCategories = this.merchObservable
		//     .filter(merch => !isNullOrUndefined(merch))
		//     .map(merch => merch.sizeTable)
		//     .map(sizeTable => {
		//         return Object.keys(sizeTable).reduce((prev: string[], size: string) => {
		//             Object.keys(sizeTable[size]).forEach(category => {
		//                 if (prev.indexOf(category) === -1) {
		//                     prev.push(category);
		//                 }
		//             });
		//
		//             return prev;
		//         }, []);
		//     });
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
