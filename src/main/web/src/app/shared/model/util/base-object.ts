import {ClubRole, idToClubRoleEnum} from "../club-role";
import {jsonToPermissions, UserPermissions} from "../permission";
import {isArray} from "util";
import {Gender} from "../gender";
import {isNumber} from "../../../util/util";
import * as moment from "moment-timezone";
import {PaymentMethod, toPaymentMethod} from "../../../shop/checkout/payment/payment-method";


export abstract class BaseObject<T extends BaseObject<T>> {

	constructor(public readonly id: number) {

	}


	private getIsoDateFromDateTimeObject({date: {day, month, year}, time: {hour, minute, second}}): string {
		return year + "-" +
			((+month < 10) ? '0' + month : month) + "-" +
			((+day < 10) ? '0' + day : day) + "T" +
			((+hour < 10) ? '0' + hour : hour) + ":" +
			((+minute < 10) ? '0' + minute : minute) + ":" +
			((+second < 10) ? '0' + second : second) + "Z";


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

				} else if ((key.toLowerCase().includes("date")
						|| key.toLowerCase().includes("day")
						|| key.toLowerCase().includes("time"))) {
					if(value.date && value.time){
						// value = moment.tz(this.getIsoDateFromDateTimeObject(value), "Europe/Berlin");
						value = moment(this.getIsoDateFromDateTimeObject(value)).tz("Europe/Berlin").locale("de");
					}
					else{
						// value = moment.tz(value, "Europe/Berlin");
						value = moment(value).tz("Europe/Berlin").locale("de");
					}
				} else if (isNumber(value)) {
					value = +value;
				}
				if(key === "event"){

				}
				if (key === "expectedRole") {
					value = ClubRole[properties[key]]
				} else if (key === "clubRole") {
					value = isNumber(value) ? idToClubRoleEnum(value) : ClubRole[properties[key]];
				} else if (key === "permissions") {
					value = jsonToPermissions(properties[key]);
				} else if (key === "gender") {
					value = Gender[Gender[(<any>properties[key])]];
				} else if (key === "method" && isNumber(value)){
					value = toPaymentMethod(value);
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
