import {DateAdapter} from "@angular/material";
import {
	addDays,
	addMonths,
	addYears,
	format,
	getDate,
	getDay,
	getDaysInMonth,
	getMonth,
	getYear,
	isDate,
	isValid,
	parse,
	setDate,
	setMonth,
	setYear
} from "date-fns";
import * as deLocale from "date-fns/locale/de";
import {isString} from "./util";

interface DisplayFormat {
	day?: string;
	month?: string;
	year?: string;
}

const ISO_8601_REGEX =
	/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|(?:(?:\+|-)\d{2}:\d{2}))?)?$/;

function isDisplayFormat(value: any): value is DisplayFormat {
	return value.day !== undefined || value.month !== undefined || value.year !== undefined;
}

function range<T>(length: number, mappingFunction: (index: number) => T): T[] {
	return Array.from(Array(length).keys())
		.map((it, i) => i + 1)
		.map(mappingFunction);
}

export class DateFnsAdapter extends DateAdapter<Date> {

	_localeData = {
		//todo the locale is hardcoded :/
		dateNames: range(31, i => "" + i),
		monthNames: {
			long: range(12, i => format(this.createDate(2018, i - 1, 1), "MMMM", {
				locale: deLocale
			})),
			short: range(12, i => format(this.createDate(2018, i - 1, 1), "MMM", {
				locale: deLocale
			})),
			narrow: range(12, i => format(this.createDate(2018, i - 1, 1), "MMM", {
				locale: deLocale
			}))
				.map(it => it.substring(0, 1))
		},
		longDaysOfWeek: range(7, i => format(this.createDate(2018, 0, i), "dddd", {
			locale: deLocale
		})),
		shortDaysOfWeek: range(7, i => format(this.createDate(2018, 0, i), "ddd", {
			locale: deLocale
		})),
		narrowDaysOfWeek: range(7, i => format(this.createDate(2018, 0, i), "dd", {
			locale: deLocale
		}))
	};


	addCalendarDays(date: Date, days: number): Date {
		return addDays(date, days);
	}

	addCalendarMonths(date: Date, months: number): Date {
		return addMonths(date, months);
	}

	addCalendarYears(date: Date, years: number): Date {
		return addYears(date, years);
	}

	clone(date: Date): Date {
		return parse(date);
	}

	createDate(year: number, month: number, day: number): Date {
		const date = setYear(setMonth(setDate(new Date(), day), month), year);
		if (isValid(date)) {
			return date;
		}
		return null;
	}

	format(date: Date, displayFormat: any): string {
		let formatString = "";
		if (isString(displayFormat)) {
			formatString = displayFormat;
		}
		//"numeric" | "long"
		if (isDisplayFormat(displayFormat)) {
			formatString = this._getFormatString(displayFormat);
		}

		return format(date, formatString, {
			locale: deLocale
		});
	}

	getDate(date: Date): number {
		console.log(date);
		return getDate(date);
	}

	getDateNames(): string[] {
		return this._localeData.dateNames;
	}

	getDayOfWeek(date: Date): number {
		return (getDay(date) - 1 + 7) % 7;
	}

	getDayOfWeekNames(style: "long" | "short" | "narrow"): string[] {
		if (style == "long") {
			return this._localeData.longDaysOfWeek;
		}
		if (style == "short") {
			return this._localeData.shortDaysOfWeek;
		}
		return this._localeData.narrowDaysOfWeek;
	}

	getFirstDayOfWeek(): number {
		return 0;
	}

	getMonth(date: Date): number {
		return getMonth(date);
	}

	getMonthNames(style: "long" | "short" | "narrow"): string[] {
		return this._localeData.monthNames[style];
	}

	getNumDaysInMonth(date: Date): number {
		return getDaysInMonth(date);
	}

	getYear(date: Date): number {
		return getYear(date);
	}

	getYearName(date: Date): string {
		return getYear(date) + "";
	}

	invalid(): Date {
		return new Date(2018, 0, -1);
	}

	isDateInstance(obj: any): boolean {
		return isDate(obj);
	}

	isValid(date: Date): boolean {
		return isValid(date);
	}

	parse(value: any, parseFormat: any): Date | null {
		const dateFormatRegex = /[\d]{2}\.[\d]{2}\.[\d]{2,4}/;
		//todo: update once calendar updates to v2 of date-fns..
		let date = null;
		if (dateFormatRegex.test(value)) {
			const parts = value.match(/(\d+)/g);
			// note parts[1]-1
			date = new Date(parts[2], parts[1] - 1, parts[0]);
		}
		if (ISO_8601_REGEX.test(value)) {
			date = parse(value);
		}

		return date;
	}

	toIso8601(date: Date): string {
		return date.toISOString();
	}

	today(): Date {
		return new Date();
	}

	private _getFormatString(displayFormat: DisplayFormat): string {
		let formatString = "";
		if (displayFormat.day) {
			if (displayFormat.day === "numeric") {
				formatString += "DD.";
			}
		}
		if (displayFormat.month) {
			if (displayFormat.month === "numeric") {
				formatString += "MM.";
			}
			if (displayFormat.month === "short") {
				if (formatString.length > 0) {
					formatString += " ";
				}
				formatString += "MMM ";
			}
			if (displayFormat.month === "long") {
				if (formatString.length > 0) {
					formatString += " ";
				}
				formatString += "MMMM ";
			}
		}
		if (displayFormat.year) {
			if (displayFormat.year === "numeric") {
				formatString += "YYYY";
			}
		}
		return formatString;
	}

}
