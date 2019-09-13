import {Pipe, PipeTransform} from "@angular/core";
import {formatDistance, parseISO} from "date-fns";
import {de} from "date-fns/locale";

@Pipe({
	name: "relativeTimeFormat"
})
export class RelativeTimeFormatPipe implements PipeTransform {
	transform(value: Date | string): string {
		let date: Date;
		if (value instanceof Date) {
			date = value;
		} else {
			date = parseISO(value);
		}
		return formatDistance(date, new Date(), {includeSeconds: false, addSuffix: true, locale: de})
	}
}
