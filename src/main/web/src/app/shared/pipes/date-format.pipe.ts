import {Pipe, PipeTransform} from "@angular/core";
import {differenceInDays, differenceInYears, distanceInWordsToNow, format, isBefore, parse} from "date-fns";
import {isString} from "../../util/util";

import * as deLocale from "date-fns/locale/de/index"

@Pipe({
	name: "dateFormat"
})
export class DateFormatPipe implements PipeTransform {
	transform(value: Date | string, formatString: string = "DD.MM.YYYY"): string {
		if (isString(value)) {
			return format(parse(value), formatString, {locale: deLocale});
		}
		if (formatString === "relative") {
			const distance = distanceInWordsToNow(value, {locale: deLocale});
			const before = isBefore(value, new Date());
			const suffix = (["Tage", "Monate", "Jahre"].some(it => distance.includes(it))) ? "n" : "";

			return (before ? "vor " : "in ") + distance + suffix;
		}
		if (formatString === "age") {
			const difference = -differenceInYears(value, new Date());

			return difference + " Jahr" + ((difference === 1) ? "" : "e");
		}
		if(formatString === "days"){
			const diff = -differenceInDays(value, new Date());

			return diff + " Tag" + (diff === 1 ? '' : 'en');
		}

		return format(value, formatString, {locale: deLocale})
	}
}
