import {ClubRole, idToClubRoleEnum} from "../club-role";
import {jsonToPermissions, UserPermissions} from "../permission";
import {isArray} from "util";
import {isNumber, isString} from "../../../util/util";
import {toPaymentMethod} from "../../../shop/checkout/payment/payment-method";
import {parseISO} from "date-fns";


export interface DateTimeObject {
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

export interface DateObject {
	chronology: { id: string, calendarType: string };
	dayOfMonth: number;
	dayOfWeek: string;
	dayOfYear: number;
	era: string;
	leapYear: boolean;
	month: string;
	monthValue: number;
	year: number;
}

export function getIsoDateFromDateTimeObject(dateTime: DateTimeObject): string {
	let {year, monthValue, dayOfMonth, hour, minute, second} = dateTime;

	return year + "-" +
		((+monthValue < 10) ? "0" + monthValue : monthValue) + "-" +
		((+dayOfMonth < 10) ? "0" + dayOfMonth : dayOfMonth) + "T" +
		((+hour < 10) ? "0" + hour : hour) + ":" +
		((+minute < 10) ? "0" + minute : minute) + ":" +
		((+second < 10) ? "0" + second : second) + "Z";
}

export function getIsoDateFromDateObject(date: DateObject): string {
	return getIsoDateFromDateTimeObject({
		year: date.year,
		month: date.month,
		monthValue: date.monthValue,
		dayOfMonth: date.dayOfMonth,
		hour: 0,
		minute: 0,
		second: 0,
		dayOfWeek: date.dayOfWeek,
		dayOfYear: date.dayOfYear,
		nano: 0
	});
}

export interface BaseObject {
	id: number;
}


/**
 * @param object
 * @param properties
 * @returns a copy of the object with changed values
 */
export function setProperties<T>(object: T, properties: any): T {
	const copy = Object.assign({}, object);

	Object.keys(properties)
		.forEach((key: string) => {
			let value: (string | number | number[] | Date | UserPermissions | any) = (<any>properties)[key];
			if (isArray(value)) {

			} else if ((key.toLowerCase().includes("date")
				|| key.toLowerCase().includes("day")
				|| key.toLowerCase().includes("time"))) {
				if (value.dayOfMonth && value.minute) {
					value = parseISO(getIsoDateFromDateTimeObject(value));
				} else if (isString(value)){
					value = parseISO(value);
				} else{
					value = new Date(value);
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
			} else if (key === "permissions" && properties[key]) {
				value = jsonToPermissions(properties[key]);
			} else if (key === "gender") {
				value = properties[key];
			} else if (key === "method" && isNumber(value)) {
				value = toPaymentMethod(value);
			}

			copy[key] = value;
		});
	return copy;
}
