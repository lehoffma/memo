import {DateAdapter, MdDateFormats} from "@angular/material";
import * as moment from "moment";
import {isMoment, Moment} from "moment";

/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, Injectable, Optional} from '@angular/core';
import {MAT_DATE_LOCALE} from '@angular/material';



export const MD_MOMENT_DATE_FORMATS: MdDateFormats = {
	parse: {
		dateInput: 'l',
	},
	display: {
		dateInput: 'l',
		monthYearLabel: 'MMM YYYY',
		dateA11yLabel: 'LL',
		monthYearA11yLabel: 'MMMM YYYY',
	},
};


/** Creates an array and fills it with values. */
function range<T>(length: number, valueFunction: (index: number) => T): T[] {
	const valuesArray = Array(length);
	for (let i = 0; i < length; i++) {
		valuesArray[i] = valueFunction(i);
	}
	return valuesArray;
}


/** Adapts Moment.js Dates for use with Angular Material. */
@Injectable()
export class MomentDateAdapter extends DateAdapter<Moment> {
	// Note: all of the methods that accept a `Moment` input parameter immediately call `this.clone`
	// on it. This is to ensure that we're working with a `Moment` that has the correct locale setting
	// while avoiding mutating the original object passed to us. Just calling `.locale(...)` on the
	// input would mutate the object.

	private _localeData: {
		firstDayOfWeek: number,
		longMonths: string[],
		shortMonths: string[],
		dates: string[],
		longDaysOfWeek: string[],
		shortDaysOfWeek: string[],
		narrowDaysOfWeek: string[]
	};

	constructor(@Optional() @Inject(MAT_DATE_LOCALE) dateLocale: string) {
		super();
		this.setLocale(dateLocale || moment.locale());
	}

	setLocale(locale: string) {
		super.setLocale(locale);

		let momentLocaleData = moment.localeData(locale);
		this._localeData = {
			firstDayOfWeek: momentLocaleData.firstDayOfWeek(),
			longMonths: momentLocaleData.months(),
			shortMonths: momentLocaleData.monthsShort(),
			dates: range(31, (i) => this.createDate(2017, 0, i + 1).format('D')),
			longDaysOfWeek: momentLocaleData.weekdays(),
			shortDaysOfWeek: momentLocaleData.weekdaysShort(),
			narrowDaysOfWeek: momentLocaleData.weekdaysMin(),
		};
	}

	getYear(date: Moment): number {
		return this.clone(date).year();
	}

	getMonth(date: Moment): number {
		return this.clone(date).month();
	}

	getDate(date: Moment): number {
		return this.clone(date).date();
	}

	getDayOfWeek(date: Moment): number {
		return this.clone(date).day();
	}

	getMonthNames(style: 'long' | 'short' | 'narrow'): string[] {
		// Moment.js doesn't support narrow month names, so we just use short if narrow is requested.
		return style == 'long' ? this._localeData.longMonths : this._localeData.shortMonths;
	}

	getDateNames(): string[] {
		return this._localeData.dates;
	}

	getDayOfWeekNames(style: 'long' | 'short' | 'narrow'): string[] {
		if (style == 'long') {
			return this._localeData.longDaysOfWeek;
		}
		if (style == 'short') {
			return this._localeData.shortDaysOfWeek;
		}
		return this._localeData.narrowDaysOfWeek;
	}

	getYearName(date: Moment): string {
		return this.clone(date).format('YYYY');
	}

	getFirstDayOfWeek(): number {
		return this._localeData.firstDayOfWeek;
	}

	getNumDaysInMonth(date: Moment): number {
		return this.clone(date).daysInMonth();
	}

	clone(date: Moment): Moment {
		return date.clone().locale(this.locale);
	}

	createDate(year: number, month: number, date: number): Moment {
		// Moment.js will create an invalid date if any of the components are out of bounds, but we
		// explicitly check each case so we can throw more descriptive errors.
		if (month < 0 || month > 11) {
			throw Error(`Invalid month index "${month}". Month index has to be between 0 and 11.`);
		}

		if (date < 1) {
			throw Error(`Invalid date "${date}". Date has to be greater than 0.`);
		}

		let result = moment({year, month, date}).locale(this.locale);

		// If the result isn't valid, the date must have been out of bounds for this month.
		if (!result.isValid()) {
			throw Error(`Invalid date "${date}" for month with index "${month}".`);
		}

		return result;
	}

	today(): Moment {
		return moment().locale(this.locale);
	}

	parse(value: any, parseFormat: string | string[]): Moment | null {
		if (value && typeof value == 'string') {
			return moment(value, parseFormat, this.locale);
		}
		return value ? moment(value).locale(this.locale) : null;
	}

	format(date: Moment, displayFormat: string): string {
		date = this.clone(date);
		if (!this.isValid(date)) {
			throw Error('MomentDateAdapter: Cannot format invalid date.');
		}
		return date.format(displayFormat);
	}

	addCalendarYears(date: Moment, years: number): Moment {
		return this.clone(date).add({years});
	}

	addCalendarMonths(date: Moment, months: number): Moment {
		return this.clone(date).add({months});
	}

	addCalendarDays(date: Moment, days: number): Moment {
		return this.clone(date).add({days});
	}

	toIso8601(date: Moment): string {
		return this.clone(date).format();
	}

	fromIso8601(iso8601String: string): Moment | null {
		let d = moment(iso8601String, moment.ISO_8601).locale(this.locale);
		return this.isValid(d) ? d : null;
	}

	isDateInstance(obj: any): boolean {
		return moment.isMoment(obj);
	}

	isValid(date: Moment): boolean {
		return this.clone(date).isValid();
	}
}


// const dateNames: string[] = [];
// for (let date = 1; date <= 31; date++) {
// 	dateNames.push(String(date));
// }
//
// export class MomentDateAdapter extends DateAdapter<Moment> {
//
// 	private localeData = moment.localeData();
//
// 	constructor() {
// 		super();
// 		this.locale = "de";
// 	}
//
// 	// public locale = "en";
//
// 	getYear(date: Moment): number {
// 		return date.locale(this.locale).year();
// 	}
//
// 	getMonth(date: Moment): number {
// 		return date.locale(this.locale).month();
// 	}
//
// 	getDate(date: Moment): number {
// 		return date.locale(this.locale).date();
// 	}
//
// 	getDayOfWeek(date: Moment): number {
// 		return date.locale(this.locale).day();
// 	}
//
// 	getMonthNames(style: "long" | "short" | "narrow"): string[] {
// 		switch (style) {
// 			case "long":
// 				return this.localeData.months();
// 			case "short":
// 				return this.localeData.monthsShort();
// 			case "narrow":
// 				return this.localeData.monthsShort().map(month => month[0]);
// 		}
// 	}
//
// 	getDateNames(): string[] {
// 		return dateNames;
// 	}
//
// 	getDayOfWeekNames(style: "long" | "short" | "narrow"): string[] {
// 		switch (style) {
// 			case "long":
// 				return this.localeData.weekdays();
// 			case "short":
// 				return this.localeData.weekdaysShort();
// 			case "narrow":
// 				// Moment does not accept format even though @types/moment suggests it does
// 				return this.localeData.weekdaysShort();
// 		}
// 	}
//
// 	getYearName(date: Moment): string {
// 		return String(date.locale(this.locale).year());
// 	}
//
// 	getFirstDayOfWeek(): number {
// 		return this.localeData.firstDayOfWeek();
// 	}
//
// 	getNumDaysInMonth(date: Moment): number {
// 		return date.locale(this.locale).daysInMonth();
// 	}
//
// 	clone(date: Moment): Moment {
// 		return date.clone();
// 	}
//
// 	createDate(year: number, month: number, date: number): Moment {
// 		return moment([year, month, date]).locale(this.locale);
// 	}
//
// 	today(): Moment {
// 		return moment().locale(this.locale);
// 	}
//
// 	parse(value: any, parseFormat: any): Moment {
// 		if (value === undefined) {
// 			return value;
// 		}
// 		let m = moment(value, parseFormat, this.locale, true);
// 		if (!m.isValid()) {
// 			// try again, forgiving. will get warning if not ISO8601 or RFC2822
// 			m = moment(value);
// 			// console.log(`Moment could not parse '${value}', trying non-strict`, m);
// 		}
// 		if (m.isValid()) {
// 			// if user omits year, it defaults to 2001, so check for that issue.
// 			if (m.year() === 2001 && value.indexOf("2001") === -1) {
// 				// if 2001 not actually in the value string, change to current year
// 				const currentYear = new Date().getFullYear();
// 				m.set("year", currentYear);
// 				// if date is in the future, set previous year
// 				if (m.isAfter(moment())) {
// 					m.set("year", currentYear - 1);
// 				}
// 			}
// 			return m.locale(this.locale);
// 		}
// 		else {
// 			return null;
// 		}
// 	}
//
// 	format(date: Moment, displayFormat: any): string {
// 		if (date) {
// 			return date.locale(this.locale).format(displayFormat);
// 		}
// 		else {
// 			return "";
// 		}
// 	}
//
// 	addCalendarYears(date: Moment, years: number): Moment {
// 		return date.locale(this.locale).clone().add(years, "y");
// 	}
//
// 	addCalendarMonths(date: Moment, months: number): Moment {
// 		return date.locale(this.locale).clone().add(months, "M");
// 	}
//
// 	addCalendarDays(date: Moment, days: number): Moment {
// 		return date.locale(this.locale).clone().add(days, "d");
// 	}
//
// 	getISODateString(date: Moment): string {
// 		return date.locale(this.locale).toISOString();
// 	}
//
// 	setLocale(locale: any): void {
// 		console.info("setLocale", locale);
// 		this.localeData = moment.localeData(locale);
// 		this.locale = locale;
// 	}
//
// 	compareDate(first: Moment, second: Moment): number {
// 		return first.diff(second, "seconds", true);
// 	}
//
// 	sameDate(first: any | Moment, second: any | Moment): boolean {
// 		if (first == null) {
// 			// same if both null
// 			return second == null;
// 		}
// 		else if (isMoment(first)) {
// 			return first.isSame(second);
// 		}
// 		else {
// 			const isSame = super.sameDate(first, second);
// 			console.warn("first not a Moment. fallback to super.sameDate()", first, second, isSame);
// 			return isSame;
// 		}
// 	}
//
// 	clampDate(date: Moment, min?: any | Moment, max?: any | Moment): Moment {
// 		if (min && date.isBefore(min)) {
// 			return min;
// 		}
// 		else if (max && date.isAfter(max)) {
// 			return max;
// 		}
// 		else {
// 			return date;
// 		}
// 	}
//
//
// 	toIso8601(date: moment.Moment): string {
// 		return undefined;
// 	}
//
// 	fromIso8601(iso8601String: string): any | moment.Moment {
// 		return undefined;
// 	}
//
// 	isDateInstance(obj: any): boolean {
// 		return undefined;
// 	}
//
// 	isValid(date: moment.Moment): boolean {
// 		return undefined;
// 	}
// }
