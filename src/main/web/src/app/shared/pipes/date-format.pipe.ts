import {Pipe, PipeTransform} from "@angular/core";
import {distanceInWordsToNow, format, isBefore, parse} from "date-fns";
import {isString} from "../../util/util";

import * as deLocale from "date-fns/locale/de/index"

@Pipe({
	name: "dateFormat"
})
export class DateFormatPipe implements PipeTransform {
	transform(value: Date | string, formatString: string = "DD.MM.YYYY"): any {
		if (isString(value)) {
			return format(parse(value), formatString, {locale: deLocale});
		}
		if(formatString === "relative"){
			const distance = distanceInWordsToNow(value, {locale: deLocale});
			const before = isBefore(value, new Date());
			const suffix = (["Tage", "Monate", "Jahre"].some(it => distance.includes(it))) ? "n" : "";

			return (before ? "vor " : "in ") + distance + suffix;
		}

		return format(value, formatString, {locale: deLocale})
	}
}
