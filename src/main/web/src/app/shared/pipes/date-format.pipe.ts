import {Pipe, PipeTransform} from "@angular/core";
import {differenceInDays, differenceInYears, format, formatDistance, parseISO} from "date-fns";
import {isString} from "../../util/util";

import {de as deLocale} from "date-fns/locale"

@Pipe({
	name: "dateFormat"
})
export class DateFormatPipe implements PipeTransform {
	transform(value: Date | string | number, formatString: string = "dd.MM.yyyy"): string {
		let date: Date;
		if (value instanceof Date) {
			date = value;
		} else if (isString(value)) {
			date = parseISO(value);
		} else {
			date = new Date(value);
		}
		if (!value) {
			date = new Date();
		}

		if (isString(value)) {
			return format(date, formatString, {locale: deLocale});
		}
		if (formatString === "relative") {
			return formatDistance(value, new Date(), {locale: deLocale, addSuffix: true})
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
