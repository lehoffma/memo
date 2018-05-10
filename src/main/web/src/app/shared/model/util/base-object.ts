import {ClubRole, idToClubRoleEnum} from "../club-role";
import {adminPermissions, jsonToPermissions, UserPermissions} from "../permission";
import {isArray} from "util";
import {isNumber} from "../../../util/util";
import {toPaymentMethod} from "../../../shop/checkout/payment/payment-method";
import {parse} from "date-fns";


interface DateTimeObject {
	dayOfMonth: number;
	dayOfWeek: string;
	dayOfYear: number;
	hour: number;
	minute: number;
	month: string;
	monthValue: number;
	nano: number;
	second: number;
	year: number;
}

function getIsoDateFromDateTimeObject(dateTime: DateTimeObject): string {
	let {year, monthValue, dayOfMonth, hour, minute, second} = dateTime;

	return year + "-" +
		((+monthValue < 10) ? "0" + monthValue : monthValue) + "-" +
		((+dayOfMonth < 10) ? "0" + dayOfMonth : dayOfMonth) + "T" +
		((+hour < 10) ? "0" + hour : hour) + ":" +
		((+minute < 10) ? "0" + minute : minute) + ":" +
		((+second < 10) ? "0" + second : second) + "Z";


}

export abstract class BaseObject<T> {

	protected constructor(public readonly id: number) {

	}


	/**
	 * @param properties
	 * @returns {PaymentInfo} this
	 */
	setProperties(properties: Partial<T>): T{
		Object.keys(properties)
			.forEach((key: string) => {
				let value: (string | number | number[] | Date | UserPermissions | any) = (<any>properties)[key];
				if (isArray(value)) {

				} else if ((key.toLowerCase().includes("date")
					|| key.toLowerCase().includes("day")
					|| key.toLowerCase().includes("time"))) {
					if (value.dayOfMonth && value.minute) {
						value = parse(getIsoDateFromDateTimeObject(value));
					}
					else {
						value = parse(value);
					}
				} else if (isNumber(value) && key !== "mobile" && key !== "telephone") {
					value = +value;
				}
				if (key === "event") {

				}
				if (key.startsWith("expected")) {
					value = ClubRole["" + properties[key]];
				} else if (key === "clubRole") {
					value = isNumber(value) ? idToClubRoleEnum(value) : ClubRole["" + properties[key]];
				} else if (key === "permissions") {
					if (properties[key] === null || ("" + properties[key]) === "null") {
						//todo demo permissions
						value = adminPermissions;
					}
					else {
						value = jsonToPermissions(properties[key]);
					}
				} else if (key === "gender") {
					value = properties[key];
				} else if (key === "method" && isNumber(value)) {
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
