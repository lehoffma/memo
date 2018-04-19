import {getYear} from "date-fns";

export const seasonOptions = [
	"Gesamt",
	...calculateSeasonOptions()
];


/**
 * Calculates every possible option for season dropdowns, from 2014 to today
 */
export function calculateSeasonOptions() {
	const FOUNDING_YEAR = 2014;
	const currentYear = getYear(new Date());
	const options = [];
	for (let i = FOUNDING_YEAR; i <= currentYear; i++) {
		const year = "" + i;
		const lastTwoDigits = year.substring(year.length - 2);
		options.push(i + "/" + (+lastTwoDigits + 1))
	}
	return options;
}
