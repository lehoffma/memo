import {DateAdapter, MdDateFormats} from "@angular/material";
import * as moment from "moment";
import {isMoment, Moment} from "moment";


//source: https://github.com/angular/material2/issues/675#issuecomment-302275678

export const MOMENT_DATE_FORMATS: MdDateFormats = {
	parse: {
		dateInput: "l"
	},
	display: {
		dateInput: "l",
		monthYearLabel: "MMMM Y",
		dateA11yLabel: "LL",
		monthYearA11yLabel: "MMMM Y"
	}
};

const dateNames: string[] = [];
for (let date = 1; date <= 31; date++) {
	dateNames.push(String(date));
}

export class MomentDateAdapter extends DateAdapter<Moment> {

	private localeData = moment.localeData();

	constructor() {
		super();
		this.locale = "de";
	}

	// public locale = "en";

	getYear(date: Moment): number {
		return date.locale(this.locale).year();
	}

	getMonth(date: Moment): number {
		return date.locale(this.locale).month();
	}

	getDate(date: Moment): number {
		return date.locale(this.locale).date();
	}

	getDayOfWeek(date: Moment): number {
		return date.locale(this.locale).day();
	}

	getMonthNames(style: "long" | "short" | "narrow"): string[] {
		switch (style) {
			case "long":
				return this.localeData.months();
			case "short":
				return this.localeData.monthsShort();
			case "narrow":
				return this.localeData.monthsShort().map(month => month[0]);
		}
	}

	getDateNames(): string[] {
		return dateNames;
	}

	getDayOfWeekNames(style: "long" | "short" | "narrow"): string[] {
		switch (style) {
			case "long":
				return this.localeData.weekdays();
			case "short":
				return this.localeData.weekdaysShort();
			case "narrow":
				// Moment does not accept format even though @types/moment suggests it does
				return this.localeData.weekdaysShort();
		}
	}

	getYearName(date: Moment): string {
		return String(date.locale(this.locale).year());
	}

	getFirstDayOfWeek(): number {
		return this.localeData.firstDayOfWeek();
	}

	getNumDaysInMonth(date: Moment): number {
		return date.locale(this.locale).daysInMonth();
	}

	clone(date: Moment): Moment {
		return date.clone();
	}

	createDate(year: number, month: number, date: number): Moment {
		return moment([year, month, date]).locale(this.locale);
	}

	today(): Moment {
		return moment().locale(this.locale);
	}

	parse(value: any, parseFormat: any): Moment {
		if (value === undefined) {
			return value;
		}
		let m = moment(value, parseFormat, this.locale, true);
		if (!m.isValid()) {
			// try again, forgiving. will get warning if not ISO8601 or RFC2822
			m = moment(value);
			// console.log(`Moment could not parse '${value}', trying non-strict`, m);
		}
		if (m.isValid()) {
			// if user omits year, it defaults to 2001, so check for that issue.
			if (m.year() === 2001 && value.indexOf("2001") === -1) {
				// if 2001 not actually in the value string, change to current year
				const currentYear = new Date().getFullYear();
				m.set("year", currentYear);
				// if date is in the future, set previous year
				if (m.isAfter(moment())) {
					m.set("year", currentYear - 1);
				}
			}
			return m.locale(this.locale);
		}
		else {
			return null;
		}
	}

	format(date: Moment, displayFormat: any): string {
		if (date) {
			return date.locale(this.locale).format(displayFormat);
		}
		else {
			return "";
		}
	}

	addCalendarYears(date: Moment, years: number): Moment {
		return date.locale(this.locale).clone().add(years, "y");
	}

	addCalendarMonths(date: Moment, months: number): Moment {
		return date.locale(this.locale).clone().add(months, "M");
	}

	addCalendarDays(date: Moment, days: number): Moment {
		return date.locale(this.locale).clone().add(days, "d");
	}

	getISODateString(date: Moment): string {
		return date.locale(this.locale).toISOString();
	}

	setLocale(locale: any): void {
		console.info("setLocale", locale);
		this.localeData = moment.localeData(locale);
		this.locale = locale;
	}

	compareDate(first: Moment, second: Moment): number {
		return first.diff(second, "seconds", true);
	}

	sameDate(first: any | Moment, second: any | Moment): boolean {
		if (first == null) {
			// same if both null
			return second == null;
		}
		else if (isMoment(first)) {
			return first.isSame(second);
		}
		else {
			const isSame = super.sameDate(first, second);
			console.warn("first not a Moment. fallback to super.sameDate()", first, second, isSame);
			return isSame;
		}
	}

	clampDate(date: Moment, min?: any | Moment, max?: any | Moment): Moment {
		if (min && date.isBefore(min)) {
			return min;
		}
		else if (max && date.isAfter(max)) {
			return max;
		}
		else {
			return date;
		}
	}
}
