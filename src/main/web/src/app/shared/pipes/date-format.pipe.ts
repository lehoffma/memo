import {Pipe, PipeTransform} from "@angular/core";
import {differenceInDays, differenceInYears, format, formatDistance, isBefore, parseISO} from "date-fns";
import {isString} from "../../util/util";

import {de as deLocale} from "date-fns/locale"

export function relativeDateFormat(value: Date) {
	const distance = formatDistance(value, new Date(), {locale: deLocale});
	const before = isBefore(value, new Date());
	const suffix = (["Tage", "Monate", "Jahre"].some(it => distance.includes(it))) ? "n" : "";

	return (before ? "vor " : "in ") + distance + suffix;
}

@Pipe({
	name: "dateFormat"
})
export class DateFormatPipe implements PipeTransform {
	transform(value: Date | string, formatString: string = "dd.MM.yyyy"): string {
		let date: Date;
		if (value instanceof Date) {
			date = value;
		} else {
			date = parseISO(value);
		}
		if(!value){
			date = new Date();
		}

		if (isString(value)) {
			return format(date, formatString, {locale: deLocale});
		}
		if (formatString === "relative") {
			return relativeDateFormat(date);
		}
		if (formatString === "age") {
			const difference = -differenceInYears(date, new Date());

			return difference + " Jahr" + ((difference === 1) ? "" : "e");
		}
		if (formatString === "days") {
			const diff = -differenceInDays(date, new Date());

			return diff + " Tag" + (diff === 1 ? "" : "en");
		}

		return format(date, formatString, {locale: deLocale})
	}
}
