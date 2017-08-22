import {ClubRole, idToClubRoleEnum} from "../club-role";
import {jsonToPermissions, UserPermissions} from "../permission";
import {isArray} from "util";
import {Gender} from "../gender";
import {isNumber, isString} from "../../../util/util";
import * as moment from "moment";


export abstract class BaseObject<T extends BaseObject<T>> {

	constructor(public readonly id: number) {

	}


	/**
	 * @param properties
	 * @returns {PaymentInfo} this
	 */
	setProperties(properties: Partial<T>) {
		Object.keys(properties)
			.forEach((key: keyof (T | this)) => {
				let value: (string | number | number[] | Date | UserPermissions | any) = (<any>properties)[key];
				if (isArray(value)) {

				} else if ((key.toLowerCase().includes("date") || key.toLowerCase().includes("day"))
					&& isString(value)) {
					value = moment(value).toDate();
				} else if (isNumber(value)) {
					value = +value;
				}

				if (key === "expectedRole") {
					value = ClubRole[properties[key]]
				} else if (key === "clubRole") {
					value = isNumber(value) ? idToClubRoleEnum(value) : ClubRole[properties[key]];
				} else if (key === "permissions") {
					value = jsonToPermissions(properties[key]);
				} else if (key === "gender") {
					value = Gender[Gender[(<any>properties[key])]];
				}
				this[key] = value;
			});
		return this;
	}


	/**
	 * Geht alle Attribute des Objektes durch und gibt true zurück, wenn der Wert mindestens eines Attributes auf den
	 * Suchbegriff matcht. Der Default-Wert des Suchbegriffs ist dabei "", für welchen immer true
	 * zurückgegeben wird (der leere String ist Teilstring von jedem String).
	 * @param searchTerm
	 * @returns {string[]}
	 */
	matchesSearchTerm(searchTerm: string = ""): boolean {
		return Object.keys(this).some(key => ("" + this[key]).toLowerCase().includes(searchTerm.toLowerCase()));
	}
}
